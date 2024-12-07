from typing import Any, List, Optional, TypedDict
from uuid import uuid4

from pydantic import BaseModel, Field


class StateMetadata(TypedDict, total=False):
    start_time: Optional[str]
    end_time: Optional[str]
    duration_ms: Optional[float]
    session_id: Optional[str]
    user_id: Optional[str]
    func_name: Optional[str]


class State(BaseModel):
    # This field is handled by Looplit
    id: str = Field(default_factory=lambda: str(uuid4()))
    metadata: Optional[StateMetadata] = None

    # Messages HAVE to follow the OpenAI schema for now
    messages: List[Any] = Field(default_factory=list)
    tools: Optional[List[Any]] = None
