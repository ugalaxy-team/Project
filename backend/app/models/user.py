from datetime import datetime
from sqlalchemy import ForeignKey, Table, Column, func, join, or_, select
from sqlalchemy.orm import Mapped, foreign, mapped_column, relationship
from sqlalchemy.ext.hybrid import hybrid_property

from .base import Base
from .mixin import PKMixin
from .team import Team, TeamMember
from .tournament import Tournament
from app.config import settings
from .notification import Notification
from .tournament import tournament_juries

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
        back_populates="user",
        lazy="selectin",
        cascade="all, delete-orphan",
        primaryjoin=lambda: or_(
            User.id == foreign(Notification.user_id), Notification.user_id == None
        ),
        viewonly=True,
    )
    role_requests: Mapped[list["RoleRequest"]] = relationship(
        back_populates="user", lazy="selectin", cascade="all, delete-orphan"
    )
    created_tournaments: Mapped[list["Tournament"]] = relationship(
        back_populates="creator",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    evaluates_in: Mapped[list["Tournament"]] = relationship(
        back_populates="juries", lazy="selectin", secondary=tournament_juries
    )
    participates_in: Mapped[list["Tournament"]] = relationship(
        "Tournament",
        secondary=lambda: join(
            TeamMember.__table__, Team.__table__, TeamMember.team_id == Team.id
        ),
        primaryjoin=lambda: User.email == foreign(TeamMember.email),
        secondaryjoin=lambda: Tournament.id == foreign(Team.tournament_id),
        viewonly=True,
        lazy="selectin",
    )

    @property
    def is_admin(self) -> bool:
        return any(role.name == settings.ROLE_NAMES.ADMIN for role in self.roles)

    @hybrid_property
    def is_jury(self) -> bool:
        if "evaluates_in" in self.__dict__:
            return len(self.evaluates_in) > 0
        return False

    @is_jury.expression
    def is_jury(cls):
        return (
            select(func.count(tournament_juries.c.tournament_id))
            .where(tournament_juries.c.user_id == cls.id)
            .label("is_jury_count")
        ) > 0

    def __repr__(self):
        return f"<User(id={self.id}, full_name={self.full_name}, email={self.email})>"
