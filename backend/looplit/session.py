import asyncio
import uuid
from typing import Any, Awaitable, Callable, Dict, List, Literal, Optional, TypedDict

from pydantic import BaseModel

from looplit.state import State


def ensure_values_serializable(data):
    """
    Recursively ensures that all values in the input (dict or list) are JSON serializable.
    """

    if isinstance(data, BaseModel):
        return ensure_values_serializable(data.model_dump(warnings="none"))
    elif isinstance(data, dict):
        return {key: ensure_values_serializable(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [ensure_values_serializable(item) for item in data]
    elif isinstance(data, (str, int, float, bool, type(None))):
        return data
    elif isinstance(data, (tuple, set)):
        return ensure_values_serializable(
            list(data)
        )  # Convert tuples and sets to lists
    else:
        return str(data)  # Fallback: convert other types to string


class FuncCall(TypedDict):
    func_name: str
    lineage_id: str


class Session:
    current_tasks: List[asyncio.Task]
    call_stack: List[FuncCall]
    chats: dict[str, State]
    initial_lineage_id: Optional[str] = None
    interrupt: bool = False

    def __init__(
        self,
        socket_id: str,
        # Function to emit to the client
        emit: Callable[[str, Any], Awaitable],
        # Function to emit to the client and wait for a response
        emit_call: Callable[[Literal["interrupt"], Any], Awaitable],
    ):
        self.id = str(uuid.uuid4())
        self.current_tasks = []
        self.call_stack = []
        self.chats = {}
        self.socket_id = socket_id
        self.emit_call = emit_call
        self.emit = emit

        self.restored = False

        sessions_id[self.id] = self
        sessions_sid[socket_id] = self

    def restore(self, new_socket_id: str):
        """Associate a new socket id to the session."""
        sessions_sid.pop(self.socket_id, None)
        sessions_sid[new_socket_id] = self
        self.socket_id = new_socket_id
        self.restored = True

    def delete(self):
        """Delete the session."""
        sessions_sid.pop(self.socket_id, None)
        sessions_id.pop(self.id, None)

    @classmethod
    def get(cls, socket_id: str):
        """Get session by socket id."""
        return sessions_sid.get(socket_id)

    @classmethod
    def get_by_id(cls, session_id: str):
        """Get session by session id."""
        return sessions_id.get(session_id)

    @classmethod
    def require(cls, socket_id: str):
        """Throws an exception if the session is not found."""
        if session := cls.get(socket_id):
            return session
        raise ValueError("Session not found")

    async def start(self, func_name):
        await self.emit("start", {"name": func_name})

    async def end(self, func_name):
        await self.emit("end", {"name": func_name})

    async def send_error(self, lineage_id: str, error: str):
        await self.emit("error", {"lineage_id": lineage_id, "error": error})

    async def send_interrupt(self, func_name: str):
        await self.emit_call("interrupt", {"func_name": func_name})

    async def send_stateful_funcs(self, stateful_funcs: dict[str, object]):
        await self.emit("stateful_funcs", stateful_funcs)

    async def send_output_state(self, func_name: str, lineage_id: str, state: State):
        state.messages = ensure_values_serializable(state.messages)
        await self.emit(
            "output_state",
            {
                "func_name": func_name,
                "lineage_id": lineage_id,
                "state": ensure_values_serializable(state),
            },
        )

    async def sync_tool_calls(
        self,
        funcs_to_tool_calls: dict[str, list[str]],
        funcs_to_lineage_ids: dict[str, list[str]],
    ):
        funcs = funcs_to_tool_calls.keys()
        for func in funcs:
            tool_calls = funcs_to_tool_calls.get(func, [])
            lineage_ids = funcs_to_lineage_ids.get(func, [])

            for tc, lid in zip(tool_calls, lineage_ids):
                if tc and lid:
                    await self.emit("map_tc_to_lid", {"tc": tc, "lid": lid})

    async def canvas_agent_start(self):
        await self.emit("canvas_agent_start", {})

    async def canvas_agent_end(self, response=None, error=None):
        await self.emit("canvas_agent_end", {"response": response, "error": error})
        
    async def send_state_edit(self, old_str: str, new_str: str):
        await self.emit("state_edit", {"old_str": old_str, "new_str": new_str})

sessions_sid: Dict[str, Session] = {}
sessions_id: Dict[str, Session] = {}
