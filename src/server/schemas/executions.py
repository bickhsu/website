from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID
from typing import Optional


class ExecutionBase(BaseModel):
    problem_statement: str
    status: str = "To-Do"
    value_delivered: Optional[str] = None

class ExecutionCreate(ExecutionBase):
    pass

class ExecutionOut(ExecutionBase):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
