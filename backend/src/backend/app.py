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


@app.get("/")
def home():
    return {"message": "Hello, Bick! FastAPI is running."}


@app.post("/api/write")
def write_article(article: Article):
    """Recive title and content then save it into txt file"""
    filename = f"{article.title}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.md"
    filepath = ARTICLES_DIR / filename

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(article.content)

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
    """Read article by filename"""

    # prevent injection
    if not is_safe_filename(filename):
        raise HTTPException(status_code=400, detail="Invalid filename")

    # normalize path
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


@app.post("/api/delete/{filename}")
def delete_article(filename: str):
    """Delete article by filename"""

    # prevent injection
    if not is_safe_filename(filename):
        raise HTTPException(status_code=400, detail="Invalid filename")

    # normalize path
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


def is_safe_filename(filename: str) -> bool:
    return bool(re.fullmatch(r"^[A-Za-z0-9][A-Za-z0-9._-]*$", filename))


def is_safe_filepath(filepath: Path) -> bool:
    if ARTICLES_DIR in filepath.parents():
        return True
    else:
        return False
    