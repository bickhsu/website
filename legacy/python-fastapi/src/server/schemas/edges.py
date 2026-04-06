from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID
from .enums import EntityType


class EdgeCreate(BaseModel):
    source_id: UUID
    source_type: EntityType
    target_id: UUID
    target_type: EntityType

class EdgeOut(EdgeCreate):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
