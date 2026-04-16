from typing import Annotated
from datetime import datetime
from typing_extensions import Self
from pydantic import BaseModel, Field, field_validator, model_validator


class TournamentModels(BaseModel):
    title: str = Field(..., min_length=3)
    description: str
    start_date: datetime
    reg_start: datetime
    reg_end: datetime
    max_team: int = Field(..., gt=0)

    @field_validator("title")
    @classmethod
    def check_title(cls, value: str):
        return value.strip()

    @field_validator("reg_start")
    @classmethod
    def check__date(cls, value: datetime):
        if value <= datetime.now():
            raise ValueError("Registration cannot start in the past")
        return value

    @model_validator(mode="after")
    def check_dates(self) -> Self:
        if self.reg_end <= self.reg_start:
            raise ValueError("reg_end must be later than reg_start")
        if self.start_date <= self.reg_end:
            raise ValueError("Tournament must start after registration ends")

        return self


class TournamentStatusOptionModel(BaseModel):
    name: str = Field(..., min_length=3)
