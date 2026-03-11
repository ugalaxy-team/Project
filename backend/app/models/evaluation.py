from sqlalchemy import ForeignKey, Table, Column
from sqlalchemy.orm import mapped_column, Mapped, relationship
from .base import Base

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


class SubmissionEvaluation(Base):
    __tablename__ = "evaluations"
    submission_id: Mapped[int] = mapped_column(
        ForeignKey("submissions.team_id"), primary_key=True
    )
    jury_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)

    submission: Mapped["Submission"] = relationship(back_populates="evaluations", lazy="selectin")
    jury: Mapped["User"] = relationship(lazy="selectin")
    evaluations: Mapped[list["RequirementEvaluation"]] = relationship(
        back_populates="evaluation", lazy="selectin"
    )


class RequirementEvaluation(Base):
    __tablename__ = "requirement_evaluations"
    evaluation_id: Mapped[int] = mapped_column(
        ForeignKey("evaluations.id"), primary_key=True
    )
    evaluation: Mapped["SubmissionEvaluation"] = relationship(
        back_populates="requirement_evaluations", lazy="selectin"
    )
    score: Mapped[int]
    requirement: Mapped["TaskRequirementOption"] = relationship(lazy="selectin")
