from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Table, Column

from .base import Base
from .mixin import PKMixin, OptionMixin
from .evaluation import JuryAssignment
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
    min_reviews_per_submission: Mapped[int] = mapped_column(default=1)
    max_score: Mapped[int] = mapped_column(default=100)
    is_leaderboard_visible: Mapped[bool] = mapped_column(default=False)
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
    status: Mapped["TaskStatusOption"] = relationship(back_populates="tasks", lazy="selectin")
    requirements: Mapped[list["TaskRequirementOption"]] = relationship(
        secondary=task_requirements, lazy="selectin"
    )
    evaluation_categories: Mapped[list["TaskEvaluationCategory"]] = relationship(
        back_populates="task", lazy="selectin", cascade="all, delete-orphan"
    )
    jury_assignments: Mapped[list["JuryAssignment"]] = relationship(
        back_populates="task", lazy="selectin", cascade="all, delete-orphan"
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


class TaskEvaluationCategory(Base, PKMixin):
    __tablename__ = "task_evaluation_categories"

    task_id: Mapped[int] = mapped_column(
        ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str]

    task: Mapped["Task"] = relationship(
        back_populates="evaluation_categories", lazy="selectin"
    )
    criteria: Mapped[list["TaskEvaluationCriterion"]] = relationship(
        back_populates="category", lazy="selectin", cascade="all, delete-orphan"
    )


class TaskEvaluationCriterion(Base, PKMixin):
    __tablename__ = "task_evaluation_criteria"

    category_id: Mapped[int] = mapped_column(
        ForeignKey("task_evaluation_categories.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str]
    description: Mapped[str | None] = mapped_column(nullable=True)
    weight: Mapped[int] = mapped_column(default=1)
    max_score: Mapped[int] = mapped_column(default=10)

    category: Mapped["TaskEvaluationCategory"] = relationship(
        back_populates="criteria", lazy="selectin"
    )
    criterion_scores: Mapped[list["CriterionScore"]] = relationship(
        back_populates="criterion", lazy="selectin"
    )
