# IMPORT BUILT-IN
from pathlib import Path

# IMPORT THIRD-PARTY
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


ROOT_DIR = Path(__file__).resolve().parents[2]

DB_DIR = ROOT_DIR / "data" / "db"
DB_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DB_DIR / "app.db"

DB_URL = f"sqlite:///{DB_PATH}"


engine = create_engine(
    DB_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()