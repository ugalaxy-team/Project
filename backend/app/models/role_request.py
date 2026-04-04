from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String
from .base import Base
from .mixin import PKMixin, OptionMixin


class RoleRequest(Base, PKMixin):
    __tablename__ = "role_requests"

    role_name: Mapped[str] = mapped_column(ForeignKey("roles.name"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    role: Mapped["Role"] = relationship(back_populates="requests", lazy="selectin")
    user: Mapped["User"] = relationship(back_populates="role_requests", lazy="selectin")
    info: Mapped[list['RoleRequestInfo']] = relationship(
        back_populates='request', 
        lazy='selectin',
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<RoleRequest(role_name={self.role_name}, user_id={self.user_id})>"

class RoleRequestInfoOption(Base, OptionMixin):
    __tablename__ = 'role_request_info_options'

class RoleRequestInfo(Base, PKMixin):
    __tablename__ = 'role_request_info'
    request_id: Mapped[int] = mapped_column(ForeignKey('role_requests.id'))
    option_name: Mapped[str] = mapped_column(ForeignKey('role_request_info_options.name'))
    value: Mapped[str] = mapped_column(String(4096))

    request: Mapped[RoleRequest] = relationship(back_populates='info', lazy='selectin')
    option: Mapped[RoleRequestInfoOption] = relationship(lazy='selectin')

    def __repr__(self):
        return f"<RoleRequestInfo(request_id={self.request_id}, key={self.option_name}>"
