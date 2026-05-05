from __future__ import annotations

from typing import TYPE_CHECKING, Annotated

from datetime import datetime
from pydantic import AfterValidator, BaseModel, ConfigDict, Field, AliasPath

from .option import OptionPublic
from .task import TaskPublic

if TYPE_CHECKING:
    from .team import TeamPublic
    from .user import UserPublic

StrippedStr = Annotated[str, AfterValidator(lambda v: v.strip())]


class TournamentBase(BaseModel):
    title: StrippedStr = Field(..., min_length=3)
    description: str
    start_date: datetime
    reg_start: datetime
    reg_end: datetime
    min_people_in_team: int = Field(..., gt=0)
    max_people_in_team: int = Field(..., gt=0)
    max_teams: int = Field(..., gt=0)


class TournamentCreate(TournamentBase):
    juries: list[int | str] = Field(..., description='Jury ids')


class TournamentUpdate(BaseModel):
    title: StrippedStr | None = Field(None, min_length=3)
    description: str | None = None
    start_date: datetime | None = None
    reg_start: datetime | None = None
    reg_end: datetime | None = None
    max_teams: int | None = Field(None, gt=0)
    juries: list[int | str] | None = Field(None, description='Jury ids')


class TournamentStatusOptionModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: StrippedStr = Field(..., min_length=3)


class TournamentPublic(TournamentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    end_date: datetime | None
    creator: 'UserPublic'
    status: OptionPublic
    tasks: list[TaskPublic]
    active_task: TaskPublic | None
    teams: list[TeamPublic]
    juries: list['UserPublic']
    status_name: str = Field(validation_alias=AliasPath("status", "display_name"))
