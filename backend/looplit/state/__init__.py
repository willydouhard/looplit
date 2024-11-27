from typing import Any, List, Optional
from uuid import uuid4

from pydantic import BaseModel, Field


class State(BaseModel):
    # This field is handled by Looplit
    id: str = Field(default_factory=lambda: str(uuid4()))

    # Messages HAVE to follow the OpenAI schema for now
    messages: List[Any] = Field(default_factory=list)
    tools: Optional[List[Any]] = None
