from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from .base import Base, engine



class Quote(Base):
    __tablename__ = "quotes"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(nullable=False)
    text: Mapped[str] = mapped_column(nullable=False)
    author: Mapped[str] = mapped_column(nullable=False)
    date_created: Mapped[datetime] = mapped_column(default=datetime.now)

    def __repr__(self) -> str:
        return f"Quote(id={self.id}, user_id={self.user_id}, text={self.text}, author={self.author}, date_created={self.date_created})"

class Quota(Base):
    __tablename__ = "quotas"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(nullable=False, unique=True)
    remaining: Mapped[int] = mapped_column(default=50)
    last_reset: Mapped[datetime] = mapped_column(default=datetime.now)

    def __repr__(self) -> str:
        return f"Quota(id={self.id}, user_id={self.user_id}, remaining={self.remaining}, last_reset={self.last_reset})"

Base.metadata.create_all(engine)