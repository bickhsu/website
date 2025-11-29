# IMPORT BUILT-IN
from pathlib import Path
from datetime import datetime

# IMPORT THIRD-PARTY
from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI()

ARTICLES_DIR = Path("backend/articles")
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
    filename = f"{article.title}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.txt"
    filepath = ARTICLES_DIR / filename

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(article.content)

    return {
        "status": "ok",
        "saved_to": filepath
    }


@app.get("api/list")
def list_all_article():
    """List all articles"""
    assert ARTICLES_DIR.exists(), "Articles dir is None."
    assert ARTICLES_DIR.is_dir(), "Articles dir is not a dir."

    articles = []
    for article in ARTICLES_DIR.iterdir():
        articles.append(article)
    
    return {
        "status": "ok",
        "articles": articles
    }
