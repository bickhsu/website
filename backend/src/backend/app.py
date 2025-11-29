# IMPORT BUILT-IN
import re
from pathlib import Path
from datetime import datetime

# IMPORT THIRD-PARTY
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


app = FastAPI()

ARTICLES_DIR = Path("backend/articles").resolve()
ARTICLES_DIR.mkdir(parents=True, exist_ok=True)


class Article(BaseModel):
    title: str
    content: str


def is_safe_filename(filename: str) -> bool:
    return bool(re.fullmatch(r"^[A-Za-z0-9][A-Za-z0-9._-]*$", filename))


def is_safe_filepath(filepath: Path) -> bool:
    return ARTICLES_DIR in filepath.parents()
    

@app.get("/")
def home():
    return {
        "message": "Hello, Bick! FastAPI is running."
    }


@app.post("/api/write")
def write_article(article: Article):
    """Receive title and content then save it into .md file"""
    filename = f"{article.title}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
    filepath = ARTICLES_DIR / filename

    filepath.write_text(article.content, encoding="utf-8")

    return {
        "status": "ok",
        "saved_to": filepath
    }


@app.get("/api/list")
def list_all_article():
    """List all articles"""
    articles = [p.name for p in ARTICLES_DIR.iterdir() if p.is_file()]

    return {
        "status": "ok",
        "articles": articles
    }


@app.get("/api/read/{filename}")
def read_article(filename: str):
    """Read article by filename (full name, including .md)"""
    if not is_safe_filename(filename):
        raise HTTPException(status_code=400, detail="Invalid filename")

    filepath = (ARTICLES_DIR / filename).resolve()

    if not is_safe_filepath(filepath):
        raise HTTPException(status_code=400, detail="Invalid filename")

    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")

    try:
        content = filepath.read_text(encoding="utf-8")
        return {
            "status": "ok",
            "filename": filename,
            "content": content,
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/delete/{filename}")
def delete_article(filename: str):
    """Delete article by filename"""
    if not is_safe_filename(filename):
        raise HTTPException(status_code=400, detail="Invalid filename")

    filepath = (ARTICLES_DIR / filename).resolve()
    
    if not is_safe_filepath(filepath):
        raise HTTPException(status_code=400, detail="Invalid filename")

    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        filepath.unlink()
        return {
            "status": "ok",
            "deleted": filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

