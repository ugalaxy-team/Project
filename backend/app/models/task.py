from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Table, Column

from .base import Base
from .mixin import PKMixin, OptionMixin
from datetime import datetime

task_requirements = Table(
    "task_requirements",
    Base.metadata,
    Column(
        "requirement_id",
        ForeignKey("task_requirement_options.name", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column("task_id", ForeignKey("tasks.id", ondelete="CASCADE"), primary_key=True),
)


class Task(Base, PKMixin):
    __tablename__ = "tasks"

    title: Mapped[str]
    description: Mapped[str]
    tournament_id: Mapped[int] = mapped_column(ForeignKey("tournaments.id"))
    tournament: Mapped["Tournament"] = relationship(back_populates="tasks")
    start_time: Mapped[datetime]
    end_time: Mapped[datetime]
    status_id: Mapped[str] = mapped_column(ForeignKey("task_statuses.name"))
    status: Mapped["TaskStatusOption"] = relationship(back_populates="tasks")
    requirements: Mapped[list["TaskRequirementOption"]] = relationship(
        secondary=task_requirements
    )


class TaskStatusOption(Base, OptionMixin):
    __tablename__ = "task_statuses"
    tasks: Mapped[list["Task"]] = relationship(back_populates="status")


class TaskRequirementOption(Base, OptionMixin):
    __tablename__ = "task_requirement_options"
    category_id: Mapped[str] = mapped_column(ForeignKey("task_statuses.name"))
    category: Mapped["TaskRequirementCategory"] = relationship()


class TaskRequirementCategory(Base, OptionMixin):
    __tablename__ = "task_requirement_categories"
    category_id: Mapped[str] = mapped_column(
        ForeignKey("task_requirement_categories.name")
    )
    category: Mapped["TaskRequirementCategory"] = relationship(
        back_populates="category"
    )
    task_requirement_options: Mapped[list["TaskRequirementOption"]] = relationship(
        back_populates="category"
    )
