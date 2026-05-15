from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey

from .base import Base
from .mixin import PKMixin
from typing import Optional


class Notification(Base, PKMixin):
    __tablename__ = "notifications"

    body: Mapped[str] = mapped_column()
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))

    user: Mapped[Optional["User"]] = relationship(
        back_populates="notifications", lazy="selectin"
    )

    def __repr__(self):
        body_preview = self.body[:20]
        if len(self.body) > 20:
            body_preview += "..."
        return f"<Notification(id={self.id}, user_id={self.user_id}, body={body_preview})>"
