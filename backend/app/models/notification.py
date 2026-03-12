from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey

from .base import Base
from .mixin import PKMixin


class Notification(Base, PKMixin):
    __tablename__ = "notifications"

    body: Mapped[str] = mapped_column(String(4096), unique=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    user: Mapped["User"] = relationship(
        "User", back_populates="notifications", lazy="selectin"
    )

    def __repr__(self):
        return f"<Notification(body={self.body[:20]})>"
