from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from uuid import UUID
from typing import Optional
from .enums import DomainEnum


class FragmentBase(BaseModel):
    title: Optional[str] = None
    content: str = Field(..., min_length=5, description="零碎知識點的具體內容")
    hook: Optional[str] = None
    domain: DomainEnum = Field(default=DomainEnum.UNCATEGORIZED)

class FragmentCreate(FragmentBase):
    linked_execution_id: Optional[UUID] = None

class FragmentOut(FragmentBase):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
