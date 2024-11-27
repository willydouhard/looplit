import asyncio
from contextvars import ContextVar
from typing import Union

from lazify import LazyProxy

from looplit.session import Session


class LooplitContextException(Exception):
    def __init__(self, msg="Looplit context not found", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)


class LooplitContext:
    loop: asyncio.AbstractEventLoop
    session: Session

    def __init__(
        self,
        session: Session,
    ):
        self.loop = asyncio.get_running_loop()
        self.session = session


context_var: ContextVar[LooplitContext] = ContextVar("looplit")


def init_context(session_or_sid: Union[Session, str]) -> LooplitContext:
    if not isinstance(session_or_sid, Session):
        session = Session.require(session_or_sid)
    else:
        session = session_or_sid
    context = LooplitContext(session)
    context_var.set(context)
    return context


def get_context() -> LooplitContext:
    try:
        return context_var.get()
    except LookupError as e:
        raise LooplitContextException() from e


context: LooplitContext = LazyProxy(get_context, enable_cache=False)
