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
    tournament_id: Mapped[int] = mapped_column(
        ForeignKey("tournaments.id", use_alter=True, name="fk_task_tournament")
    )
    tournament: Mapped["Tournament"] = relationship(
        "Tournament", back_populates="tasks", foreign_keys="Task.tournament_id", lazy="selectin"
    )
    start_time: Mapped[datetime]
    end_time: Mapped[datetime]
    status_id: Mapped[str] = mapped_column(ForeignKey("task_statuses.name"))
    status: Mapped["TaskStatusOption"] = relationship(back_populates="tasks", lazy="selectin")
    requirements: Mapped[list["TaskRequirementOption"]] = relationship(
        secondary=task_requirements, lazy="selectin"
    )


class TaskStatusOption(Base, OptionMixin):
    __tablename__ = "task_statuses"
    tasks: Mapped[list["Task"]] = relationship(back_populates="status", lazy="selectin")


class TaskRequirementOption(Base, OptionMixin):
    __tablename__ = "task_requirement_options"
    category_id: Mapped[str] = mapped_column(
        ForeignKey("task_requirement_categories.name")
    )
    category: Mapped["TaskRequirementCategory"] = relationship(
        back_populates="task_requirement_options", lazy="selectin"
    )


class TaskRequirementCategory(Base, OptionMixin):
    __tablename__ = "task_requirement_categories"
    main_id: Mapped[str] = mapped_column(ForeignKey("task_requirement_categories.name"), nullable=True)
    sub_categories: Mapped[list["TaskRequirementCategory"]] = relationship(
        back_populates="parent_category", lazy="selectin"
    )
    parent_category: Mapped["TaskRequirementCategory"] = relationship(
        back_populates="sub_categories", remote_side="TaskRequirementCategory.name", lazy="selectin"
    )
    task_requirement_options: Mapped[list["TaskRequirementOption"]] = relationship(
        back_populates="category", lazy="selectin"
    )
