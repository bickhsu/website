# IMPORT BUILT-IN
import re
import asyncio
from pathlib import Path
from datetime import datetime


# IMPORT THIRD-PARTY
from fastapi import Depends, FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from pydantic import BaseModel

# IMPORT LOCAL-MODULES
from server.database import Base, engine, DBSession
from server.models import article


BASE_DIR = Path(__file__).resolve().parents[2]
STATIC_DIR = BASE_DIR / "data" / "static"
ARTICLES_DIR = BASE_DIR / "data" / "articles"
ARTICLES_DIR.mkdir(parents=True, exist_ok=True)

Base.metadata.create_all(bind=engine) # init database

app = FastAPI()
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")



class Article(BaseModel):
    title: str
    content: str


async def get_db():
    db = DBSession()
    try:
        yield db
    finally:
        db.close()


def is_safe_filename(filename: str) -> bool:
    if "/" in filename or "\\" in filename:
        return False
    
    return bool(re.fullmatch(
        r"^[A-Za-z0-9\u4e00-\u9fff][A-Za-z0-9\u4e00-\u9fff._ -]*$",
        filename
    ))


def is_safe_filepath(filepath: Path) -> bool:
    return ARTICLES_DIR in filepath.parents
    

@app.get("/")
def serve_frontend():
    return FileResponse(STATIC_DIR / "index.html")


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


@app.get("/api/read/{filename:path}")
def read_article(filename: str):
    """Read article by filename (full name, including .md)"""
    print(filename)
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

