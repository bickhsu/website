from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import logging

from server import models, schemas
from server.database import get_db 

router = APIRouter(prefix="/api/v1/ingest", tags=["Ingestion Pipeline"])
logger = logging.getLogger(__name__)


@router.post("/fragment", response_model=schemas.FragmentOut, status_code=status.HTTP_201_CREATED)
def ingest_fragment(payload: schemas.FragmentCreate, db: Session = Depends(get_db)):
    try:
        new_fragment = models.KnowledgeFragment(
            content=payload.content,
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
