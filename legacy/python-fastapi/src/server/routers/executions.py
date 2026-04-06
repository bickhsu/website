from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from .. import models, schemas
from ..database import get_db


router = APIRouter(prefix="/api/v1/executions", tags=["Execution Units"])

@router.post("/", response_model=schemas.ExecutionOut)
def create_execution(data: schemas.ExecutionCreate, db: Session = Depends(get_db)):
    execution = models.ExecutionUnit(
        title=data.title,
        problem_statement=data.problem_statement,
        status=data.status,
        value_delivered=data.value_delivered,
        execution_log=data.execution_log
    )
    db.add(execution)
    db.commit()
    db.refresh(execution)
    return execution

@router.get("/", response_model=List[schemas.ExecutionOut])
def list_executions(db: Session = Depends(get_db)):
    return db.query(models.ExecutionUnit).order_by(models.ExecutionUnit.created_at.desc()).all()

@router.get("/{execution_id}", response_model=schemas.ExecutionOut)
def get_execution(execution_id: UUID, db: Session = Depends(get_db)):
    execution = db.query(models.ExecutionUnit).filter(models.ExecutionUnit.id == execution_id).first()
    if not execution:
        raise HTTPException(status_code=404, detail="Execution unit not found")
    return execution

@router.patch("/{execution_id}", response_model=schemas.ExecutionOut)
def update_execution(execution_id: UUID, data: schemas.ExecutionUpdate, db: Session = Depends(get_db)):
    execution = db.query(models.ExecutionUnit).filter(models.ExecutionUnit.id == execution_id).first()
    if not execution:
        raise HTTPException(status_code=404, detail="Execution unit not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(execution, key, value)
    
    db.commit()
    db.refresh(execution)
    return execution

@router.delete("/{execution_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_execution(execution_id: UUID, db: Session = Depends(get_db)):
    execution = db.query(models.ExecutionUnit).filter(models.ExecutionUnit.id == execution_id).first()
    if not execution:
        raise HTTPException(status_code=404, detail="Execution unit not found")
    
    db.delete(execution)
    db.commit()

@router.get("/{execution_id}/fragments", response_model=List[schemas.FragmentOut])
def get_execution_fragments(execution_id: UUID, db: Session = Depends(get_db)):
    # 透過 ContextualEdge 找出所有連結到此任務的 Fragment
    edges = db.query(models.ContextualEdge).filter(
        models.ContextualEdge.source_id == execution_id,
        models.ContextualEdge.source_type == 'execution_unit',
        models.ContextualEdge.target_type == 'knowledge_fragment'
    ).all()
    
    fragment_ids = [edge.target_id for edge in edges]
    return db.query(models.KnowledgeFragment).filter(models.KnowledgeFragment.id.in_(fragment_ids)).all()
