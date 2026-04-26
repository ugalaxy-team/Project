from datetime import datetime
from typing import List
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .mixin import PKMixin, OptionMixin


class Tournament(Base, PKMixin):
    __tablename__ = "tournaments"

    title: Mapped[str] = mapped_column(nullable=False)
    description: Mapped[str]
    start_date: Mapped[datetime]
    reg_start: Mapped[datetime]
    reg_end: Mapped[datetime]
    min_people_in_team: Mapped[int]
    max_people_in_team: Mapped[int]
    max_teams: Mapped[int]
    active_task_id: Mapped[int] = mapped_column(ForeignKey("tasks.id"), nullable=True)
    status_id: Mapped[str] = mapped_column(ForeignKey("tournament_status_options.name"))
    creator_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    teams: Mapped[list["Team"]] = relationship(
        back_populates="tournament", lazy="selectin"
    )
    active_task: Mapped["Task"] = relationship(
        "Task", foreign_keys="Tournament.active_task_id", lazy="selectin"
    )
    tasks: Mapped[list["Task"]] = relationship(
        "Task",
        back_populates="tournament",
        foreign_keys="Task.tournament_id",
        lazy="selectin",
    )
    status: Mapped["TournamentStatusOption"] = relationship(
        back_populates="tournaments", lazy="selectin"
    )
    creator: Mapped["User"] = relationship(
        back_populates="created_tournaments", lazy="selectin"
    )

    def __repr__(self):
        return f"<Tournament(id={self.id}, title={self.title})>"


class TournamentStatusOption(Base, OptionMixin):
    __tablename__ = "tournament_status_options"

    name: Mapped[str] = mapped_column(primary_key=True, index=True)

    tournaments: Mapped[List["Tournament"]] = relationship(
        back_populates="status", lazy="selectin"
    )
