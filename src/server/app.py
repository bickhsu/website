# IMPORT BUILT-IN
import re
from pathlib import Path
from datetime import datetime

# IMPORT THIRD-PARTY
from fastapi import Depends, FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from sqlalchemy.orm import Session

from pydantic import BaseModel

# IMPORT LOCAL-MODULES
from server.database import Base, engine, DBSession, get_db
from server.models import Article


BASE_DIR = Path(__file__).resolve().parents[2]
STATIC_DIR = BASE_DIR / "data" / "static"

Base.metadata.create_all(bind=engine) # init database
app = FastAPI()
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


class ArticleCreate(BaseModel):
    title: str
    content: str

class ArticleUpdate(BaseModel):
    title: str | None = None
    content: str | None = None

class ArticleOut(BaseModel):
    id: int
    title: str
    content: str
    created_at: str
    updated_at: str

    model_config = {
        "from_attributes": True
    }
    

@app.get("/")
def serve_frontend():
    return FileResponse(STATIC_DIR / "index.html")


@app.post("/articles", response_model=ArticleOut)
def write_article(data: ArticleCreate, db: Session = Depends(get_db)):
    """Receive title and content then save it into database"""
    article = Article(title=data.title, content=data.content)
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


@app.get("/articles", response_model=list[ArticleOut])
def list_articles(db: Session = Depends(get_db)):
    """List all articles"""
    row = db.query(Article).order_by(Article.created_at.desc()).all()
    return row


@app.get("/articles/{article_id}", response_model=ArticleOut)
def read_article(article_id: int, db: Session = Depends(get_db)):
    """Read article by id"""
    article = db.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@app.put("/articles/{article_id}", response_model=ArticleOut)
def update_article(article_id: int, data: ArticleUpdate, db: Session = Depends(get_db)):
    """Update article by id"""
    article = db.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    if data.title is not None:
        article.title = data.title
    if data.content is not None:
        article.content = data.content
    
    db.commit()
    db.refresh(article)
    return article


@app.delete("/articles/{article_id}")
def delete_article(article_id: int, db: Session = Depends(get_db)):
    """Delete article by id"""
    article = db.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    db.delete(article)
    db.commit()
    return {"status": "delete"}

