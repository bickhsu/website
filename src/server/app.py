from pathlib import Path
from typing import List

from fastapi import Depends, FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from server.database import Base, engine, get_db
from server.models import KnowledgeFragment
from server import schemas
from server.routers import ingest_router, executions_router


Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(ingest_router)
app.include_router(executions_router)

BASE_DIR = Path(__file__).resolve().parents[2]
STATIC_DIR = BASE_DIR / "data" / "static"

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
def serve_frontend():
    return FileResponse(STATIC_DIR / "index.html")

@app.get("/fragments", response_model=List[schemas.FragmentOut])
def list_fragments(db: Session = Depends(get_db)):
    return db.query(KnowledgeFragment).order_by(KnowledgeFragment.created_at.desc()).all()
