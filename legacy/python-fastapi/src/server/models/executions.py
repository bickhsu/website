from sqlalchemy import Column, String, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from .database import Base

class ExecutionUnit(Base):
    __tablename__ = "execution_units"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(150), nullable=False, server_default="Untitled Action")
    domain = Column(String(50), server_default="General")
    status = Column(String(20), server_default="To-Do")
    problem_statement = Column(Text, nullable=False)
    value_delivered = Column(Text)
    execution_log = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
