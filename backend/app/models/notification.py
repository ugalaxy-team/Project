from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey

from .base import Base
from .mixin import PKMixin
from .user import User


class Notification(Base, PKMixin):
    __tablename__ = "notifications"

    body: Mapped[str] = mapped_column(String(4096), unique=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))

    user: Mapped["User"] = relationship(
        back_populates="notifications"
    )

    def __repr__(self):
        return f"<Notification(body={self.body[:20]})>"
