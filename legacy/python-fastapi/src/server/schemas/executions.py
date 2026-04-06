from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID
from typing import Optional


class ExecutionBase(BaseModel):
    title: str = "Untitled Action"
    problem_statement: str
    status: str = "To-Do"
    value_delivered: Optional[str] = None
    execution_log: Optional[str] = None

class ExecutionCreate(ExecutionBase):
    pass

class ExecutionUpdate(BaseModel):
    title: Optional[str] = None
    problem_statement: Optional[str] = None
    status: Optional[str] = None
    value_delivered: Optional[str] = None
    execution_log: Optional[str] = None

class ExecutionOut(ExecutionBase):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
