from sqlalchemy import Column, String, DateTime, func, Index
from sqlalchemy.dialects.postgresql import UUID
import uuid
from server.database import Base

class ContextualEdge(Base):
    __tablename__ = "contextual_edges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id = Column(UUID(as_uuid=True), nullable=False)
    source_type = Column(String(50), nullable=False) # e.g., 'execution_unit'
    target_id = Column(UUID(as_uuid=True), nullable=False)
    target_type = Column(String(50), nullable=False) # e.g., 'knowledge_fragment'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 複合索引，優化圖譜遍歷查詢
    __table_args__ = (
        Index('idx_edges_source', 'source_id', 'source_type'),
        Index('idx_edges_target', 'target_id', 'target_type'),
    )
