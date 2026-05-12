from datetime import datetime

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .mixin import PKMixin, DatetimeMixin, OptionMixin


class JuryAssignmentStatusOption(Base, OptionMixin):
    __tablename__ = "jury_assignment_statuses"
    jury_assignments: Mapped[list["JuryAssignment"]] = relationship(
        back_populates="status", lazy="selectin", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return (
            f"<JuryAssignmentStatusOption(name={self.name}, display_name={self.display_name})>"
        )


class JuryAssignment(Base, PKMixin, DatetimeMixin):
    __tablename__ = "jury_assignments"
    __table_args__ = (UniqueConstraint("submission_id", "jury_id"),)

    task_id: Mapped[int] = mapped_column(ForeignKey("tasks.id", ondelete="CASCADE"))
    submission_id: Mapped[int] = mapped_column(
        ForeignKey("submissions.team_id", ondelete="CASCADE"), nullable=False
    )
    jury_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    status_id: Mapped[str] = mapped_column(
        ForeignKey("jury_assignment_statuses.name", ondelete="CASCADE"),
        default="assigned",
    )
    status: Mapped["JuryAssignmentStatusOption"] = relationship(
        back_populates="jury_assignments", lazy="selectin"
    )

    task: Mapped["Task"] = relationship(back_populates="jury_assignments", lazy="selectin")
    submission: Mapped["Submission"] = relationship(
        back_populates="assignments", lazy="selectin"
    )
    jury: Mapped["User"] = relationship(lazy="selectin")
    evaluation: Mapped["SubmissionEvaluation"] = relationship(
        back_populates="assignment",
        lazy="selectin",
        cascade="all, delete-orphan",
        uselist=False,
    )


class SubmissionEvaluation(Base, PKMixin, DatetimeMixin):
    __tablename__ = "evaluations"
    __table_args__ = (UniqueConstraint("jury_id", "submission_id"),)

    assignment_id: Mapped[int] = mapped_column(
        ForeignKey("jury_assignments.id", ondelete="CASCADE"), nullable=False
    )
    submission_id: Mapped[int] = mapped_column(
        ForeignKey("submissions.team_id", ondelete="CASCADE"), nullable=False
    )
    jury_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    comment: Mapped[str | None] = mapped_column(nullable=True)

    assignment: Mapped["JuryAssignment"] = relationship(
        back_populates="evaluation", lazy="selectin"
    )
    submission: Mapped["Submission"] = relationship(
        back_populates="evaluations", lazy="selectin"
    )
    jury: Mapped["User"] = relationship(lazy="selectin")
    criterion_scores: Mapped[list["CriterionScore"]] = relationship(
        back_populates="evaluation", lazy="selectin", cascade="all, delete-orphan"
    )


class CriterionScore(Base, PKMixin):
    __tablename__ = "criterion_scores"
    __table_args__ = (UniqueConstraint("evaluation_id", "criterion_id"),)

    evaluation_id: Mapped[int] = mapped_column(
        ForeignKey("evaluations.id", ondelete="CASCADE"), nullable=False
    )
    criterion_id: Mapped[int] = mapped_column(
        ForeignKey("task_evaluation_criteria.id", ondelete="CASCADE"), nullable=False
    )
    score: Mapped[int]

    evaluation: Mapped["SubmissionEvaluation"] = relationship(
        back_populates="criterion_scores", lazy="selectin"
    )
    criterion: Mapped["TaskEvaluationCriterion"] = relationship(
        back_populates="criterion_scores", lazy="selectin"
    )
