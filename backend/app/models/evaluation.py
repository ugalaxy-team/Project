from sqlalchemy import ForeignKey, Table, Column, UniqueConstraint
from sqlalchemy.orm import mapped_column, Mapped, relationship

from .base import Base
from .mixin import PKMixin

evaluation_requirements = Table(
    "evaluation_requirements",
    Base.metadata,
    Column(
        "requirement_evaluation_id",
        ForeignKey("requirement_evaluations.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "requirement_id",
        ForeignKey("task_requirement_options.name", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class SubmissionEvaluation(Base, PKMixin):
    __tablename__ = "evaluations"
    __table_args__ = (UniqueConstraint("submission_id", "jury_id"),)
    submission_id: Mapped[int] = mapped_column(
        ForeignKey("submissions.team_id"), nullable=False
    )
    jury_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    submission: Mapped["Submission"] = relationship(back_populates="evaluations", lazy="selectin")
    jury: Mapped["User"] = relationship(lazy="selectin")
    evaluations: Mapped[list["RequirementEvaluation"]] = relationship(
        back_populates="evaluation", lazy="selectin"
    )


class RequirementEvaluation(Base, PKMixin):
    __tablename__ = "requirement_evaluations"
    evaluation_id: Mapped[int] = mapped_column(
        ForeignKey("evaluations.id"), nullable=False
    )
    evaluation: Mapped["SubmissionEvaluation"] = relationship(
        back_populates="requirement_evaluations", lazy="selectin"
    )
    score: Mapped[int]
    requirement: Mapped[list["TaskRequirementOption"]] = relationship(
        secondary=evaluation_requirements, lazy="selectin"
    )
