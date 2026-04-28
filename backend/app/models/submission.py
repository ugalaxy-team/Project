from .base import Base
from .mixin import OptionMixin
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey


class Submission(Base):
    __tablename__ = "submissions"
    team_id: Mapped[int] = mapped_column(
        ForeignKey("teams.id", ondelete="CASCADE"), primary_key=True
    )

    team: Mapped["Team"] = relationship(back_populates="submission", single_parent=True, lazy="selectin")
    urls: Mapped[list["SubmissionUrl"]] = relationship(
        back_populates="submission", lazy="selectin", cascade="all, delete-orphan"
    )
    evaluations: Mapped[list["SubmissionEvaluation"]] = relationship(
        back_populates="submission", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Submission(team_id={self.team_id})>"


class SubmissionUrl(Base):
    __tablename__ = "submission_urls"
    submission_id: Mapped[int] = mapped_column(
        ForeignKey("submissions.team_id", ondelete="CASCADE"), primary_key=True
    )
    url_id: Mapped[int] = mapped_column(
        ForeignKey("submission_url_options.name", ondelete="CASCADE"), primary_key=True
    )

    submission: Mapped["Submission"] = relationship(back_populates="urls", lazy="selectin")
    url: Mapped["SubmissionUrlOption"] = relationship(lazy="selectin")

    def __repr__(self):
        return f"<SubmissionUrl(submission_id={self.submission_id}, url_id={self.url_id})>"


class SubmissionUrlOption(Base, OptionMixin):
    __tablename__ = "submission_url_options"

    def __repr__(self):
        return f"<SubmissionUrlOption(name={self.name}, display_name={self.display_name})>"
