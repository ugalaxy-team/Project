from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from .base import Base
from .mixin import PKMixin


class Team(Base, PKMixin):
    __tablename__ = "teams"
    __table_args__ = (UniqueConstraint("contact_info", "tournament_id"),)
    
    name: Mapped[str] = mapped_column(nullable=False, unique=True)
    team_email: Mapped[str] = mapped_column(nullable=False, unique=True)
    contact_info: Mapped[str] = mapped_column(nullable=False, unique=True)
    tournament_id: Mapped[int] = mapped_column(ForeignKey("tournaments.id"))
    captain_id: Mapped[int] = mapped_column(
        ForeignKey("team_members.id", ondelete="CASCADE"), nullable=True
    )

    tournament: Mapped["Tournament"] = relationship(
        back_populates="teams", lazy="selectin"
    )
    members: Mapped[list["TeamMember"]] = relationship(
        back_populates="team",
        foreign_keys="TeamMember.team_id",
        cascade="all, delete-orphan",
    )
    captain: Mapped["TeamMember"] = relationship(
        "TeamMember", foreign_keys="Team.captain_id", post_update=True
    )

    submission: Mapped["Submission"] = relationship(
        back_populates="team", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Team(id={self.id}, name='{self.name}')>"


class TeamMember(Base, PKMixin):
    __tablename__ = "team_members"

    full_name: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(nullable=False)
    telegram: Mapped[str] = mapped_column(nullable=False)
    educational_institution: Mapped[Optional[str]] = mapped_column(nullable=True)
    team_id: Mapped[int] = mapped_column(
        ForeignKey("teams.id", use_alter=True, name="fk_teammember_team")
    )
    # This field exists so we can impose contraints related to it
    tournament_id: Mapped[int] = mapped_column(ForeignKey("tournaments.id"))
    
    __table_args__ = (
        UniqueConstraint("tournament_id", "email", name="uq_tournament_member_email"),
        UniqueConstraint("tournament_id", "telegram", name="uq_tournament_member_telegram"),
        UniqueConstraint("team_id", "email", name="uq_team_member_email"),
        UniqueConstraint("team_id", "telegram", name="uq_team_member_telegram"),
    )

    team: Mapped["Team"] = relationship(
        back_populates="members", foreign_keys=[team_id], lazy="selectin"
    )

    tournament: Mapped["Tournament"] = relationship(
        foreign_keys=[tournament_id], lazy="selectin"
    )

    def __repr__(self):
        return (
            f"<TeamMember(id={self.id}, name='{self.full_name}', email='{self.email}')>"
        )
