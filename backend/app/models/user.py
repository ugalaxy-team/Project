from datetime import datetime
from sqlalchemy import ForeignKey, Table, Column, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .mixin import PKMixin

user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_name", ForeignKey("roles.name", ondelete="CASCADE"), primary_key=True),
)


class User(Base, PKMixin):
    __tablename__ = "users"
    # Firbase user id
    firebase_uid: Mapped[str] = mapped_column(unique=True)
    full_name: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(nullable=False, unique=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    telegram: Mapped[str] = mapped_column(nullable=True)
    github: Mapped[str] = mapped_column(nullable=True)
    discord: Mapped[str] = mapped_column(nullable=True)

    roles: Mapped[list["Role"]] = relationship(
        secondary=user_roles, back_populates="users", lazy="selectin"
    )
    notifications: Mapped[list["Notification"]] = relationship(
        back_populates="user", lazy="selectin"
    )
    role_requests: Mapped[list["RoleRequest"]] = relationship(
        back_populates="user", lazy="selectin"
    )
    notifications: Mapped[list["Notification"]] = relationship(back_populates="user", lazy="selectin")
    role_requests: Mapped[list["RoleRequest"]] = relationship(back_populates="user", lazy="selectin")
    created_tournaments: Mapped[list["Tournament"]] = relationship(
        back_populates="creator", lazy="selectin",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"
