from .base import Base
from .mixin import OptionMixin
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey


class Submission(Base):
    __tablename__ = "submissions"
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id"), primary_key=True)
    team: Mapped["Team"] = relationship(back_populates="submission", single_parent=True, lazy="selectin")
    urls: Mapped[list["SubmissionUrl"]] = relationship(back_populates="submission", lazy="selectin")


class SubmissionUrl(Base):
    __tablename__ = "submission_urls"
    submission_id: Mapped[int] = mapped_column(ForeignKey("submissions.team_id"))
    url_id: Mapped[int] = mapped_column(ForeignKey("submission_url_options.name"))

    submission: Mapped["Submission"] = relationship(back_populates="urls", lazy="selectin")
    url: Mapped["SubmissionUrlOption"] = relationship(lazy="selectin")


class SubmissionUrlOption(Base, OptionMixin):
    __tablename__ = "submission_url_options"
