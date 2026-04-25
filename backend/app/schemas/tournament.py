from typing import Annotated
from datetime import datetime
from pydantic import AfterValidator, BaseModel, ConfigDict, Field


StrippedStr = Annotated[str, AfterValidator(lambda v: v.strip())]


class TournamentBase(BaseModel):
    title: StrippedStr = Field(..., min_length=3)
    description: str
    start_date: datetime
    end_date: datetime
    reg_start: datetime
    reg_end: datetime
    max_teams: int = Field(..., gt=1)


class TournamentCreate(TournamentBase):
    pass


class TournamentUpdate(BaseModel):
    title: StrippedStr | None = Field(None, min_length=3)
    description: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    reg_start: datetime | None = None
    reg_end: datetime | None = None
    max_teams: int | None = Field(None, gt=1)


class TournamentStatusOptionModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: StrippedStr = Field(..., min_length=3)


class TournamentPublic(TournamentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status_name: str = Field(validation_alias="status.display_name")
