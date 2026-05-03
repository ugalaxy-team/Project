from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, event, insert

from .base import Base
from .mixin import PKMixin, DatetimeMixin, OptionMixin
from app.config import settings
from app.db import AsyncSessionLocal
from app.schemas import NotificationCreate

class NewsCattegory(Base, OptionMixin):
    __tablename__ = "news_categories"

    name: Mapped[str] = mapped_column(primary_key=True, index=True)

    def __repr__(self):
        return f"<NewsCattegory(name={self.name}, display_name={self.display_name})>"

class News(Base, PKMixin, DatetimeMixin):
    __tablename__ = "news"
    title: Mapped[str] = mapped_column(String(512))
    excerpt: Mapped[str] = mapped_column(String(512))
    body: Mapped[str] = mapped_column(String(8192))
    # If the news is important, display it as a notification for every user
    is_important: Mapped[bool]

    @property
    def read_time(self):
        return len(self.body) // settings.CHARACTERS_PER_MINUTE

    def __repr__(self):
        body_preview = self.body[:20]
        if len(self.body) > 20:
            body_preview += "..."
        return f"<News(id={self.id}, body={body_preview})>"

@event.listens_for(News, 'after_insert')
def receive_after_insert(mapper, connection, target: News):
    from .notification import Notification
    if target.is_important:
        connection.execute(
            insert(Notification).values(body=target.excerpt, is_global=True, user_id=None)
        )