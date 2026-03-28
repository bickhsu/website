from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from server import models, schemas
from server.database import get_db


router = APIRouter(prefix="/api/v1/executions", tags=["Execution Units"])

@router.post("/", response_model=schemas.ExecutionOut)
def create_execution(data: schemas.ExecutionCreate, db: Session = Depends(get_db)):
    execution = models.ExecutionUnit(
        problem_statement=data.problem_statement,
        status=data.status,
        value_delivered=data.value_delivered
    )
    db.add(execution)
    db.commit()
    db.refresh(execution)
    return execution

@router.get("/", response_model=List[schemas.ExecutionOut])
def list_executions(db: Session = Depends(get_db)):
    return db.query(models.ExecutionUnit).order_by(models.ExecutionUnit.created_at.desc()).all()
