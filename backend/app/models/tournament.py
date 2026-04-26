from datetime import datetime
from typing import List
from sqlalchemy import ForeignKey, inspect
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base
from .mixin import PKMixin, OptionMixin
from .task import Task

class Tournament(Base, PKMixin, AsyncAttrs):
    __tablename__ = "tournaments"

    title: Mapped[str] = mapped_column(nullable=False)
    description: Mapped[str]
    start_date: Mapped[datetime]
    reg_start: Mapped[datetime]
    reg_end: Mapped[datetime]
    min_people_in_team: Mapped[int]
    max_people_in_team: Mapped[int]
    max_teams: Mapped[int]
    status_id: Mapped[str] = mapped_column(ForeignKey("tournament_status_options.name"))
    creator_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    teams: Mapped[list["Team"]] = relationship(
        back_populates="tournament", lazy="selectin"
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

    @property
    def active_task(self) -> Task | None:
        tasks = self.__dict__.get("tasks")
        if tasks is None:
            session = inspect(self).session
            if session is None:
                return None
            tasks = [
                task
                for task in session.identity_map.values()
                if isinstance(task, Task) and task.tournament_id == self.id
            ]

        for task in tasks:
            if task.status_id == "active":
                return task

        return None


    @property
    def end_date(self) -> datetime | None:
        tasks = self.__dict__.get("tasks")
        if tasks is None:
            session = inspect(self).session
            if session is None:
                return None

            tasks = [
                task
                for task in session.identity_map.values()
                if isinstance(task, Task) and task.tournament_id == self.id
            ]
        return max((task.end_time for task in tasks), default=None)

    def __repr__(self):
        return f"<Tournament(id={self.id}, title={self.title}, status_id={self.status_id})>"


class TournamentStatusOption(Base, OptionMixin):
    __tablename__ = "tournament_status_options"

    name: Mapped[str] = mapped_column(primary_key=True, index=True)

    tournaments: Mapped[List["Tournament"]] = relationship(
        back_populates="status", lazy="selectin"
    )

    def __repr__(self):
        return f"<TournamentStatusOption(name={self.name}, display_name={self.display_name})>"
