from pydantic import BaseModel, Field, ConfigDict
from typing import Literal, Optional, List
from datetime import datetime
from uuid import UUID

EntityType = Literal[
    'execution_unit',
    'decision_record',
    'knowledge_fragment',
    'strategic_hypothesis'
]


# --- Knowledge Fragment ---
class FragmentBase(BaseModel):
    content: str = Field(..., min_length=5, description="零碎知識點的具體內容")
    domain: Optional[str] = "General"


class FragmentCreate(FragmentBase):
    linked_execution_id: Optional[UUID] = None


class FragmentOut(FragmentBase):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# --- Execution Unit ---
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


# --- Contextual Edge ---
class EdgeCreate(BaseModel):
    source_id: UUID
    source_type: EntityType
    target_id: UUID
    target_type: EntityType


class EdgeOut(EdgeCreate):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
