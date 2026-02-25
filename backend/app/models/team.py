from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .mixin import PKMixin


class Team(Base, PKMixin):
    __tablename__ = "teams"

    name: Mapped[str]
    team_email: Mapped[str]
    contact_info: Mapped[str]
    tournament_id: Mapped[int] = mapped_column(ForeignKey("tournaments.id"))
    captain_id: Mapped[int] = mapped_column(ForeignKey("team_members.id"))

    tournament: Mapped["Tournament"] = relationship(back_populates="teams")
    members: Mapped[list["TeamMember"]] = relationship(
        back_populates="team", foreign_keys="TeamMember.team_id"
    )

    def __repr__(self):
        return f"<Team(id={self.id}, name='{self.name}')>"


class TeamMember(Base, PKMixin):
    __tablename__ = "team_members"

    full_name: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(unique=True)
    telegram_username: Mapped[str] = mapped_column(unique=True)
    educational_institution: Mapped[str]
    team_id: Mapped[int] = mapped_column(
        ForeignKey("teams.id", use_alter=True, name="fk_teammember_team")
    )

    team: Mapped["Team"] = relationship(
        back_populates="members", foreign_keys=[team_id]
    )

    def __repr__(self):
        return (
            f"<TeamMember(id={self.id}, name='{self.full_name}', email='{self.email}')>"
        )
