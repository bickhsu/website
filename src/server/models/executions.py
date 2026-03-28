from sqlalchemy import Column, String, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from server.database import Base

class ExecutionUnit(Base):
    __tablename__ = "execution_units"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    status = Column(String(20), server_default="To-Do")
    problem_statement = Column(Text, nullable=False)
    value_delivered = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
