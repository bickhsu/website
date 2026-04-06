from sqlalchemy import Column, String, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from ..database import Base

class KnowledgeFragment(Base):
    __tablename__ = "knowledge_fragments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(150), nullable=False, server_default="Untitled Fragment")
    content = Column(Text, nullable=False)
    hook = Column(Text, nullable=True)
    domain = Column(String(50), server_default="Uncategorized")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
