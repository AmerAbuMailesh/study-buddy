from sqlalchemy.orm import Session, DeclarativeBase
from sqlalchemy import create_engine, select
from datetime import datetime
from .models import Quota, Quote
from .base import engine

url = "postgresql+psycopg:///amer_bashar:Amer2004.12@localhost:5432/study_buddy"


def get_db():
    with Session(engine) as session:
        yield session

def get_quota(db: Session, user_id: str):
    return db.scalar(select(Quota).where(Quota.user_id == user_id))

def create_quota(db: Session, user_id: str):
    db_quota = Quota(user_id=user_id)
    db.add(db_quota)
    db.commit()
    db.refresh(db_quota)
    return db_quota

def reset_quota_if_needed(db: Session, quota: Quota):
    now = datetime.now()
    if (now - quota.last_reset).total_seconds() > 24 * 3600:
        quota.remaining = 50
        quota.last_reset = now
        db.commit()
        db.refresh(quota)
    return quota

def create_quote(db: Session, user_id: str, text: str, author: str):
    db_quote = Quote(user_id=user_id, text=text, author=author)
    db.add(db_quote)
    db.commit()
    db.refresh(db_quote)
    return db_quote

def get_user_quotes(db: Session, user_id: str):
    return db.scalars(select(Quote).where(Quote.user_id == user_id)).all()