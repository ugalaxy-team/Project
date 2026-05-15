from .base import Base
from .mixin import OptionMixin, PKMixin
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, UniqueConstraint


class Submission(Base, PKMixin):
    __tablename__ = "submissions"
    __table_args__ = (UniqueConstraint("team_id", "task_id"),)

    team_id: Mapped[int] = mapped_column(
        ForeignKey("teams.id", ondelete="CASCADE"), nullable=False
    )
    task_id: Mapped[int] = mapped_column(
        ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False
    )

    team: Mapped["Team"] = relationship(
        back_populates="submissions", lazy="selectin"
    )
    task: Mapped["Task"] = relationship(lazy="selectin")
    urls: Mapped[list["SubmissionUrl"]] = relationship(
        back_populates="submission", lazy="selectin", cascade="all, delete-orphan"
    )
    evaluations: Mapped[list["SubmissionEvaluation"]] = relationship(
        back_populates="submission", cascade="all, delete-orphan"
    )
    assignments: Mapped[list["JuryAssignment"]] = relationship(
        back_populates="submission", cascade="all, delete-orphan", lazy="selectin"
    )

    def __repr__(self):
        return f"<Submission(id={self.id}, team_id={self.team_id}, task_id={self.task_id})>"


class SubmissionUrl(Base, PKMixin):
    __tablename__ = "submission_urls"
    __table_args__ = (UniqueConstraint("submission_id", "url_id"),)
    submission_id: Mapped[int] = mapped_column(
        ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False
    )
    url_id: Mapped[int] = mapped_column(
        ForeignKey("submission_url_options.name", ondelete="CASCADE"), nullable=False
    )
    value: Mapped[str]

    submission: Mapped["Submission"] = relationship(back_populates="urls", lazy="selectin")
    url: Mapped["SubmissionUrlOption"] = relationship(lazy="selectin")

    def __repr__(self):
        return f"<SubmissionUrl(id={self.id}, submission_id={self.submission_id}, url_id={self.url_id})>"


class SubmissionUrlOption(Base, OptionMixin):
    __tablename__ = "submission_url_options"

    def __repr__(self):
        return f"<SubmissionUrlOption(name={self.name}, display_name={self.display_name})>"
