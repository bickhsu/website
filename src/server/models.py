from sqlalchemy import Column, String, Text, DateTime, func, Index
from sqlalchemy.dialects.postgresql import UUID
import uuid
from .database import Base

class KnowledgeFragment(Base):
    __tablename__ = "knowledge_fragments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = Column(Text, nullable=False)
    domain = Column(String(50), server_default="General")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ExecutionUnit(Base):
    __tablename__ = "execution_units"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    status = Column(String(20), server_default="To-Do")
    problem_statement = Column(Text, nullable=False)
    value_delivered = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ContextualEdge(Base):
    __tablename__ = "contextual_edges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id = Column(UUID(as_uuid=True), nullable=False)
    source_type = Column(String(50), nullable=False) # e.g., 'execution_unit'
    target_id = Column(UUID(as_uuid=True), nullable=False)
    target_type = Column(String(50), nullable=False) # e.g., 'knowledge_fragment'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 建立複合索引
    __table_args__ = (
        Index('idx_edges_source', 'source_id', 'source_type'),
        Index('idx_edges_target', 'target_id', 'target_type'),
    )