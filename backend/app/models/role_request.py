# from sqlalchemy.orm import Mapped, mapped_column, relationship
# from sqlalchemy import ForeignKey

# from .base import Base
# from .mixin import PKMixin



# class RoleRequest(Base, PKMixin):
#     __tablename__ = "role_requests"

#     role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"))
#     user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

#     role: Mapped["Role"] = relationship(back_populates="requests")
#     user: Mapped["User"] = relationship(back_populates="role_requests")

#     def __repr__(self):
#         return f"<RoleRequest(role_id={self.role_id}, user_id={self.user_id})>"
