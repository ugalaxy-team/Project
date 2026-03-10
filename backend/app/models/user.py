from datetime import datetime
from sqlalchemy import ForeignKey, Table, Column, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .mixin import PKMixin

user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
)


class User(Base, PKMixin):
    __tablename__ = "users"

    full_name: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(nullable=False, unique=True)
    password: Mapped[str] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    roles: Mapped[list["Role"]] = relationship(
        secondary=user_roles, back_populates="users"
    )
    # notifications: Mapped[list["Notification"]] = relationship(back_populates="user")
    # role_requests: Mapped[list["RoleRequest"]] = relationship(back_populates="user")
    created_tournaments: Mapped[list["Tournament"]] = relationship(
        back_populates="creator"
    )

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.roles})>"
