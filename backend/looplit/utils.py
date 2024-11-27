import sys
from typing import Any, Coroutine, TypeVar

from pydantic import BaseModel

if sys.version_info >= (3, 10):
    from typing import ParamSpec
else:
    from typing_extensions import ParamSpec

import asyncio

T_Retval = TypeVar("T_Retval")
T_ParamSpec = ParamSpec("T_ParamSpec")
T = TypeVar("T")


def run_sync(co: Coroutine[Any, Any, T_Retval]) -> T_Retval:
    """Run the coroutine synchronously."""

    loop = asyncio.get_event_loop()
    result = loop.run_until_complete(co)
    return result


FUNCS_TO_TOOL_CALLS: dict[str, list[str]] = {}


def map_tool_calls(messages, stateful_func_names):
    messages = [m.model_dump() if isinstance(m, BaseModel) else m for m in messages]
    with_tool_calls = [
        m for m in messages if m["role"] == "assistant" and m["tool_calls"]
    ]
    last = with_tool_calls[-1] if with_tool_calls else None

    if last:
        for tool_call in last["tool_calls"]:
            func_name = tool_call["function"]["name"].removeprefix("call_")
            if func_name in stateful_func_names:
                if not func_name in FUNCS_TO_TOOL_CALLS:
                    FUNCS_TO_TOOL_CALLS[func_name] = []
                FUNCS_TO_TOOL_CALLS[func_name].append(tool_call["id"])
