from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import create_engine

url = "postgresql+psycopg://amer_bashar:Amer2004.23@localhost:5432/study_buddy"
engine = create_engine(url, echo=True)

class Base(DeclarativeBase):
    pass