from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String
from .base import Base
from .mixin import OptionMixin
from .user import User, user_roles


class Role(Base, OptionMixin):
    __tablename__ = "roles"
    description: Mapped[str] = mapped_column(String(4096))

    users: Mapped[list["User"]] = relationship(
        secondary=user_roles, back_populates="roles", lazy="selectin"
    )
    requests: Mapped[list["RoleRequest"]] = relationship(
        back_populates="role", lazy="selectin"
    )

    def __repr__(self):
        return f"<Role(name={self.name}, display_name={self.display_name})>"
