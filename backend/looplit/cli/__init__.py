import asyncio

import nest_asyncio

nest_asyncio.apply()

import inspect
import os
import site
import sys
from contextlib import asynccontextmanager
from importlib import util
from typing import Any, TypedDict

import click
import socketio
import uvicorn
from fastapi import FastAPI
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from watchfiles import awatch

from looplit.context import init_context
from looplit.decorators import STATEFUL_FUNCS
from looplit.logger import logger
from looplit.session import Session
from looplit.canvas import canvas_agent, State, tool_defs, SYSTEM_PROMPT

BACKEND_ROOT = os.path.dirname(os.path.dirname(__file__))
PACKAGE_ROOT = os.path.dirname(os.path.dirname(BACKEND_ROOT))


def get_build_dir(local_target: str, packaged_target: str) -> str:
    """
    Get the build directory based on the UI build strategy.

    Args:
        local_target (str): The local target directory.
        packaged_target (str): The packaged target directory.

    Returns:
        str: The build directory
    """
    local_build_dir = os.path.join(PACKAGE_ROOT, local_target, "dist")
    packaged_build_dir = os.path.join(BACKEND_ROOT, packaged_target, "dist")

    if os.path.exists(local_build_dir):
        return local_build_dir
    elif os.path.exists(packaged_build_dir):
        return packaged_build_dir
    else:
        raise FileNotFoundError(f"{local_target} built UI dir not found")


build_dir = get_build_dir("frontend", "frontend")

index_html_file_path = os.path.join(build_dir, "index.html")

index_html = open(index_html_file_path, encoding="utf-8").read()


def check_file(target: str):
    # Define accepted file extensions for Looplit
    ACCEPTED_FILE_EXTENSIONS = ("py", "py3")

    _, extension = os.path.splitext(target)

    # Check file extension
    if extension[1:] not in ACCEPTED_FILE_EXTENSIONS:
        if extension[1:] == "":
            raise click.BadArgumentUsage(
                "Looplit requires raw Python (.py) files, but the provided file has no extension."
            )
        else:
            raise click.BadArgumentUsage(
                f"Looplit requires raw Python (.py) files, not {extension}."
            )

    if not os.path.exists(target):
        raise click.BadParameter(f"File does not exist: {target}")


def load_module(target: str, force_refresh: bool = False):
    """Load the specified module."""

    # Get the target's directory
    target_dir = os.path.dirname(os.path.abspath(target))

    # Add the target's directory to the Python path
    sys.path.insert(0, target_dir)

    if force_refresh:
        # Get current site packages dirs
        site_package_dirs = site.getsitepackages()

        # Clear the modules related to the app from sys.modules
        for module_name, module in list(sys.modules.items()):
            if (
                hasattr(module, "__file__")
                and module.__file__
                and module.__file__.startswith(target_dir)
                and not any(module.__file__.startswith(p) for p in site_package_dirs)
            ):
                sys.modules.pop(module_name, None)

    spec = util.spec_from_file_location(target, target)
    if not spec or not spec.loader:
        return

    module = util.module_from_spec(spec)
    if not module:
        return

    spec.loader.exec_module(module)

    sys.modules[target] = module

    # Remove the target's directory from the Python path
    sys.path.pop(0)


@click.command()
@click.argument("target")
@click.option("--host", default="127.0.0.1", help="The host to run the server on.")
@click.option("--port", default=8000, help="The port to run the server on.")
def run(target, host, port):
    os.environ["LOOPLIT_DEBUG"] = "true"

    check_file(target)
    load_module(target)

    logger.info(f"Found {len(STATEFUL_FUNCS.keys())} stateful functions.")

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        """Context manager to handle app start and shutdown."""

        watch_task = None
        stop_event = asyncio.Event()

        async def watch_files_for_changes():
            extensions = [".py"]
            async for changes in awatch(os.getcwd(), stop_event=stop_event):
                for change_type, file_path in changes:
                    file_name = os.path.basename(file_path)
                    file_ext = os.path.splitext(file_name)[1]

                    if file_ext.lower() in extensions:
                        logger.info(
                            f"File {change_type.name}: {file_name}. Reloading..."
                        )

                        # Reload the module if the module name is specified in the config
                        if target:
                            try:
                                load_module(target, force_refresh=True)
                            except Exception as e:
                                logger.error(f"Error reloading module: {e}")

                        await sio.emit("code_change", target)
                        break

        watch_task = asyncio.create_task(watch_files_for_changes())

        try:
            yield
        finally:
            try:
                if watch_task:
                    stop_event.set()
                    watch_task.cancel()
                    await watch_task
            except asyncio.exceptions.CancelledError:
                pass

            # Force exit the process to avoid potential AnyIO threads still running
            os._exit(0)

    def restore_existing_session(sid, session_id, emit_fn, emit_call_fn):
        """Restore a session from the sessionId provided by the client."""
        if session := Session.get_by_id(session_id):
            session.restore(new_socket_id=sid)
            session.emit = emit_fn
            session.emit_call = emit_call_fn
            return True
        return False

    # Create FastAPI app
    app = FastAPI(lifespan=lifespan)

    sio = socketio.AsyncServer(cors_allowed_origins=[], async_mode="asgi")

    asgi_app = socketio.ASGIApp(
        socketio_server=sio,
        socketio_path="",
    )

    app.mount("/ws/socket.io", asgi_app)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.mount(
        f"/assets",
        StaticFiles(
            packages=[("looplit", os.path.join(build_dir, "assets"))],
        ),
        name="assets",
    )

    @app.get("/looplit.svg")
    async def favicon():
        return FileResponse(os.path.join(build_dir, "looplit.svg"))

    @app.get("/pattern.png")
    async def pattern():
        return FileResponse(os.path.join(build_dir, "pattern.png"))

    @app.get("/{full_path:path}")
    async def serve():
        """Serve the UI files."""
        response = HTMLResponse(content=index_html, status_code=200)
        return response

    @sio.on("connect")
    async def connect(sid, environ):
        # Session scoped function to emit to the client
        def emit_fn(event, data):
            return sio.emit(event, data, to=sid)

        # Session scoped function to emit to the client and wait for a response
        def emit_call_fn(event, data):
            return sio.call(event, data, timeout=1000000, to=sid)

        session_id = environ.get("HTTP_X_LOOPLIT_SESSION_ID")
        if restore_existing_session(sid, session_id, emit_fn, emit_call_fn):
            return True

        Session(socket_id=sid, emit=emit_fn, emit_call=emit_call_fn)

        return True

    @sio.on("connection_successful")
    async def connection_successful(sid):
        context = init_context(sid)

        if context.session.restored:
            return

        payload = {k: v["init_state"].model_dump() for (k, v) in STATEFUL_FUNCS.items()}

        await context.session.send_stateful_funcs(payload)

    @sio.on("set_interrupt")
    async def set_interrupt(sid, interrupt: bool):
        context = init_context(sid)
        context.session.interrupt = interrupt

    @sio.on("stop")
    async def stop(sid):
        if session := Session.get(sid):
            session.call_stack = []
            for task in session.current_tasks:
                task.cancel()

    class CallPayload(TypedDict):
        func_name: str
        lineage_id: str
        state: dict[str, Any]

    @sio.on("call_stateful_func")
    async def call_stateful_func(sid, payload: CallPayload):
        context = init_context(sid)

        func_name = payload["func_name"]
        func_def = STATEFUL_FUNCS.get(func_name)
        if not func_def:
            logger.warn(f"Could not find stateful func '{func_name}'.")
            return

        context.session.initial_lineage_id = payload["lineage_id"]
        context.session.call_stack = []
        func = func_def["func"]
        StateClass = func_def["init_state"].__class__
        input_state = StateClass(**payload["state"])

        if inspect.iscoroutinefunction(func):
            task = asyncio.create_task(func(input_state))
            context.session.current_tasks.append(task)
            await task
        else:
            func(input_state)

    class AiCanvasRequest(TypedDict):
        chat_id: str
        context: str
        message: str
        state: str

    @sio.on("call_canvas_agent")
    async def call_canvas_agent(sid, payload: AiCanvasRequest):
        context = init_context(sid)
        chat_id = payload["chat_id"]
        if not chat_id in context.session.chats:
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT.format(reasoning=payload["state"], flagged=payload["context"])},
                {"role": "user", "content": payload["message"]}
                ]
            context.session.chats[chat_id] = State(messages=messages, tools=tool_defs)
        else:
            last_state = context.session.chats[chat_id]
            message_content = f"""<revised-reasoning>
{payload["state"]}
</revised-reasoning>

{payload["message"]}"""
            last_state.messages.append({"role": "user", "content": message_content})

        try:
            await context.session.canvas_agent_start()
            context.session.chats[chat_id] = await canvas_agent(context.session.chats[chat_id])
            await context.session.canvas_agent_end(response=context.session.chats[chat_id].messages[-1].model_dump())
        except Exception as e:
            logger.error("Failed to run canvas agent: " + str(e))
            await context.session.canvas_agent_end(error=str(e))


    # Start the server
    async def start():
        config = uvicorn.Config(
            app,
            host=host,
            port=port,
        )
        server = uvicorn.Server(config)
        await server.serve()

    # Run the asyncio event loop instead of uvloop to enable re entrance
    asyncio.run(start())

    # uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    run()
