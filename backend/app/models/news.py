from sqlalchemy import ForeignKey, String, event, insert
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .mixin import PKMixin, DatetimeMixin, OptionMixin
from app.config import settings


class NewsCattegory(Base, OptionMixin):
    __tablename__ = "news_categories"

    name: Mapped[str] = mapped_column(primary_key=True, index=True)

    news: Mapped[list["News"]] = relationship(back_populates="category")

    def __repr__(self):
        return f"<NewsCattegory(name={self.name}, display_name={self.display_name})>"


class News(Base, PKMixin, DatetimeMixin):
    __tablename__ = "news"
    title: Mapped[str] = mapped_column(String(512))
    excerpt: Mapped[str] = mapped_column(String(512))
    body: Mapped[str] = mapped_column()
    is_important: Mapped[bool]
    category_name: Mapped[str] = mapped_column(
        ForeignKey("news_categories.name", ondelete="CASCADE")
    )

    category: Mapped["NewsCattegory"] = relationship(
        back_populates="news", lazy="selectin"
    )

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
            insert(Notification).values(body=target.excerpt, user_id=None)
        )