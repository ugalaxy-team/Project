from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Table, Column

from .base import Base
from .mixin import PKMixin, OptionMixin
from datetime import datetime

task_requirements = Table(
    "task_requirements",
    Base.metadata,
    Column("task_id", ForeignKey("tasks.id", ondelete="CASCADE"), primary_key=True),
    Column(
        "requirement_id",
        ForeignKey("task_requirement_options.name", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Task(Base, PKMixin):
    __tablename__ = "tasks"

    title: Mapped[str]
    description: Mapped[str] = mapped_column(nullable=True)
    start_time: Mapped[datetime]
    end_time: Mapped[datetime]
    tournament_id: Mapped[int] = mapped_column(
        ForeignKey(
            "tournaments.id",
            use_alter=True,
            name="fk_task_tournament",
            ondelete="CASCADE",
        )
    )
    tournament: Mapped["Tournament"] = relationship(
        "Tournament",
        back_populates="tasks",
        foreign_keys="Task.tournament_id",
        lazy="selectin",
    )
    status_id: Mapped[str] = mapped_column(
        ForeignKey("task_statuses.name", ondelete="CASCADE")
    )
    status: Mapped["TaskStatusOption"] = relationship(
        back_populates="tasks", lazy="selectin"
    )
    requirements: Mapped[list["TaskRequirementOption"]] = relationship(
        secondary=task_requirements, lazy="selectin"
    )

    def __repr__(self):
        return f"<Task(id={self.id}, title={self.title}, status_id={self.status_id}, tournament_id={self.tournament_id})>"

class TaskStatusOption(Base, OptionMixin):
    __tablename__ = "task_statuses"
    tasks: Mapped[list["Task"]] = relationship(
        back_populates="status", lazy="selectin", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<TaskStatusOption(name={self.name}, display_name={self.display_name})>"


class TaskRequirementOption(Base, OptionMixin):
    __tablename__ = "task_requirement_options"
    category_id: Mapped[str] = mapped_column(
        ForeignKey("task_requirement_categories.name", ondelete="CASCADE")
    )
    category: Mapped["TaskRequirementCategory"] = relationship(
        back_populates="task_requirement_options", lazy="selectin"
    )

    def __repr__(self):
        return f"<TaskRequirementOption(name={self.name}, display_name={self.display_name}, category_id={self.category_id})>"


class TaskRequirementCategory(Base, OptionMixin):
    __tablename__ = "task_requirement_categories"
    main_id: Mapped[str] = mapped_column(
        ForeignKey("task_requirement_categories.name", ondelete="CASCADE"),
        nullable=True,
    )
    sub_categories: Mapped[list["TaskRequirementCategory"]] = relationship(
        back_populates="parent_category",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    parent_category: Mapped["TaskRequirementCategory"] = relationship(
        back_populates="sub_categories",
        remote_side="TaskRequirementCategory.name",
        lazy="selectin",
    )
    task_requirement_options: Mapped[list["TaskRequirementOption"]] = relationship(
        back_populates="category", lazy="selectin", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<TaskRequirementCategory(name={self.name}, display_name={self.display_name}, main_id={self.main_id})>"
