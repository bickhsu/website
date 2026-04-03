from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List
import logging
from uuid import UUID

from server import models, schemas
from server.database import get_db 

router = APIRouter(prefix="/api/v1/ingest", tags=["Ingestion Pipeline"])
logger = logging.getLogger(__name__)


@router.get("/fragments", response_model=List[schemas.FragmentOut])
def list_fragments(db: Session = Depends(get_db)):
    return db.query(models.KnowledgeFragment).order_by(models.KnowledgeFragment.created_at.desc()).all()


@router.post("/fragment", response_model=schemas.FragmentOut, status_code=status.HTTP_201_CREATED)
def ingest_fragment(payload: schemas.FragmentCreate, db: Session = Depends(get_db)):
    try:
        new_fragment = models.KnowledgeFragment(
            title=payload.title,
            content=payload.content,
            hook=payload.hook,
            domain=payload.domain.value 
        )
        db.add(new_fragment)
        db.flush()

        if payload.linked_execution_id:
            new_edge = models.ContextualEdge(
                source_id=payload.linked_execution_id,
                source_type='execution_unit',
                target_id=new_fragment.id,       # 透過 flush 取得的全新 UUID
                target_type='knowledge_fragment' 
            )
            db.add(new_edge)

        db.commit()
        db.refresh(new_fragment)
        
        return new_fragment

    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database transaction failed during ingestion: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ingestion pipeline failed. Transaction safely rolled back."
        )

@router.patch("/fragment/{fragment_id}", response_model=schemas.FragmentOut)
def update_fragment(fragment_id: UUID, payload: schemas.FragmentBase, db: Session = Depends(get_db)):
    try:
        fragment = db.query(models.KnowledgeFragment).filter(models.KnowledgeFragment.id == fragment_id).first()
        if not fragment:
            raise HTTPException(status_code=404, detail="Fragment not found")
        
        fragment.title = payload.title
        fragment.content = payload.content
        fragment.hook = payload.hook
        fragment.domain = payload.domain.value
        
        db.commit()
        db.refresh(fragment)
        return fragment
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error during fragment update: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update fragment."
        )

@router.delete("/fragment/{fragment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fragment(fragment_id: UUID, db: Session = Depends(get_db)):
    try:
        fragment = db.query(models.KnowledgeFragment).filter(models.KnowledgeFragment.id == fragment_id).first()
        if not fragment:
            raise HTTPException(status_code=404, detail="Fragment not found")
        
        db.delete(fragment)
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error during fragment deletion: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete fragment."
        )
