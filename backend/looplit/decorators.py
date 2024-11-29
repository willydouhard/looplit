import functools
import inspect
import os
from asyncio import CancelledError
from typing import Callable, TypedDict, get_type_hints
from uuid import uuid4

from pydantic import create_model

from looplit.context import context
from looplit.logger import logger
from looplit.state import State
from looplit.utils import FUNCS_TO_TOOL_CALLS, map_tool_calls, run_sync


class FuncDef(TypedDict):
    func: Callable
    init_state: State


STATEFUL_FUNCS: dict[str, FuncDef] = {}

FUNCS_TO_LINEAGE_IDS: dict[str, list[str]] = {}


def stateful(init_state: State):
    def decorator(function: Callable[[State], State]) -> Callable[[State], State]:
        """
        Wraps a function to accept arguments as a dictionary.

        Args:
            function (Callable): The function to wrap.

        Returns:
            Callable: The wrapped function.
        """

        if not os.getenv("LOOPLIT_DEBUG"):
            return function

        @functools.wraps(function)
        async def async_wrapper(*args):
            # Get the parameter names of the function
            function_params = list(inspect.signature(function).parameters.keys())

            # Create a dictionary of parameter names and their corresponding values from *args
            params_values = {
                param_name: arg for param_name, arg in zip(function_params, args)
            }

            is_root_call = len(context.session.call_stack) == 0
            is_context_switch = (
                not is_root_call
                and context.session.call_stack[-1]["func_name"] != function.__name__
            )

            lineage_id = (
                context.session.initial_lineage_id
                if is_root_call
                else str(uuid4())
                if is_context_switch
                else context.session.call_stack[-1]["lineage_id"]
            )

            if is_context_switch:
                if not function.__name__ in FUNCS_TO_LINEAGE_IDS:
                    FUNCS_TO_LINEAGE_IDS[function.__name__] = []
                FUNCS_TO_LINEAGE_IDS[function.__name__].append(lineage_id)

            context.session.call_stack.append(
                {"func_name": function.__name__, "lineage_id": lineage_id}
            )

            if not is_root_call:
                await context.session.send_output_state(
                    func_name=function.__name__,
                    lineage_id=lineage_id,
                    state=args[0].copy(deep=True),
                )

            if not is_root_call and context.session.interrupt:
                await context.session.send_interrupt(func_name=function.__name__)

            await context.session.start(func_name=function.__name__)

            try:
                map_tool_calls(args[0].messages, STATEFUL_FUNCS.keys())

                await context.session.sync_tool_calls(
                    FUNCS_TO_TOOL_CALLS, FUNCS_TO_LINEAGE_IDS
                )

                result = function(**params_values)

                if inspect.iscoroutine(result):
                    result = await result

                if is_root_call:
                    await context.session.send_output_state(
                        func_name=function.__name__,
                        lineage_id=lineage_id,
                        state=result.copy(deep=True),
                    )

                return result
            except CancelledError:
                pass
            except Exception as e:
                logger.exception(e)
                await context.session.send_error(lineage_id=lineage_id, error=str(e))
            finally:
                if context.session.call_stack:
                    context.session.call_stack.pop()
                await context.session.end(func_name=function.__name__)

        def sync_wrapper(*args):
            return run_sync(async_wrapper(*args))

        wrapper = (
            async_wrapper if inspect.iscoroutinefunction(function) else sync_wrapper
        )

        STATEFUL_FUNCS[function.__name__] = {"func": wrapper, "init_state": init_state}

        return wrapper

    return decorator


def tool(func: Callable) -> Callable:
    # Extract function annotations
    annotations = get_type_hints(func)
    return_type = annotations.pop("return", None)

    # Create a Pydantic model for the function's parameters
    ParamModel = create_model(
        f"{func.__name__}_params",
        **{name: (typ, ...) for name, typ in annotations.items()},
    )  # type: ignore

    # Generate the OpenAI schema
    openai_schema = {
        "type": "function",
        "function": {
            "name": func.__name__,
            "description": func.__doc__,
            "parameters": ParamModel.model_json_schema(),
        },
    }

    # Generate the Anthropic schema
    anthropic_schema = {
        "name": func.__name__,
        "description": func.__doc__,
        "input_schema": ParamModel.model_json_schema(),
    }

    # Attach schema and model to the wrapper function for later use
    func.openai_schema = openai_schema  # type: ignore
    func.anthropic_schema = anthropic_schema  # type: ignore

    return func
