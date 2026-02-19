from typing import List
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .mixin import PKMixin
from .user import User, user_roles


class Role(Base, PKMixin):
    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(default="Team", unique=True)

    users: Mapped[List["User"]] = relationship(
        secondary=user_roles, back_populates="roles"
    )
