from __future__ import annotations

from typing import TYPE_CHECKING, Annotated

from datetime import datetime, timezone
from pydantic import (
    AfterValidator,
    BaseModel,
    ConfigDict,
    Field,
    AliasPath,
    model_validator,
)

from .option import OptionPublic
from .task import TaskPublic

if TYPE_CHECKING:
    from .team import TeamPublic
    from .user import UserMinimalPublic


def make_naive(value: datetime) -> datetime:
    if value.tzinfo is not None:
        return value.astimezone(timezone.utc).replace(tzinfo=None)
    return value


def drop_time(date: datetime) -> datetime:
    return date.replace(hour=0, minute=0, second=0, microsecond=0)


NaiveDatetime = Annotated[datetime, AfterValidator(make_naive)]
StrippedStr = Annotated[str, AfterValidator(lambda v: v.strip())]


class TournamentBase(BaseModel):
    title: StrippedStr = Field(..., min_length=3)
    description: str
    start_date: NaiveDatetime
    reg_start: NaiveDatetime
    reg_end: NaiveDatetime
    min_people_in_team: int = Field(..., gt=0)
    max_people_in_team: int = Field(..., gt=0)
    max_teams: int = Field(..., gt=0)


class TournamentCreate(TournamentBase):
    juries: list[int | str] = Field(..., description="Jury ids")

    @model_validator(mode="after")
    def validate_dates(self) -> "TournamentBase":

        now = drop_time(datetime.now(timezone.utc).replace(tzinfo=None))

        if drop_time(self.reg_start) < now:
            raise ValueError("Registration cannot start in the past")

        if drop_time(self.reg_end) <= drop_time(self.reg_start):
            raise ValueError("Registration end must be later than start")

        if self.start_date <= self.reg_end:
            raise ValueError("Tournament must start after registration ends")

        return self


class TournamentUpdate(BaseModel):
    title: StrippedStr | None = Field(None, min_length=3)
    description: str | None = None
    start_date: NaiveDatetime | None = None
    reg_start: NaiveDatetime | None = None
    reg_end: NaiveDatetime | None = None
    max_teams: int | None = Field(None, gt=0)
    juries: list[int | str] | None = Field(None, description="Jury ids")

    @model_validator(mode="after")
    def validate_dates_update(self) -> "TournamentUpdate":
        now = drop_time(datetime.now(timezone.utc).replace(tzinfo=None))

        if self.reg_start is not None and drop_time(self.reg_start) < now:
            raise ValueError("Registration start cannot be in the past")

        if self.reg_end is not None and drop_time(self.reg_end) < now:
            raise ValueError("Registration end cannot be in the past")

        if self.start_date is not None and drop_time(self.start_date) < now:
            raise ValueError("Tournament start cannot be in the past")

        if self.reg_start and self.reg_end:
            if self.reg_end <= self.reg_start:
                raise ValueError("Registration end must be later than start")

        if self.start_date and self.reg_end:
            if self.start_date <= self.reg_end:
                raise ValueError("Tournament must start after registration ends")

        return self


class TournamentStatusOptionModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: StrippedStr = Field(..., min_length=3)


class TournamentPublic(TournamentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    end_date: datetime | None
    creator: "UserMinimalPublic"
    status: OptionPublic
    tasks: list[TaskPublic]
    active_task: TaskPublic | None
    teams: list[TeamPublic]
    juries: list["UserMinimalPublic"]
    status_name: str = Field(validation_alias=AliasPath("status", "display_name"))


class TournamentPublicMinimal(TournamentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    end_date: datetime | None
    status: OptionPublic
    status_name: str = Field(validation_alias=AliasPath("status", "display_name"))
