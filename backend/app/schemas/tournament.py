from typing import Annotated
from datetime import datetime, timezone
from typing_extensions import Self
from pydantic import (
    AfterValidator,
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)


StrippedStr = Annotated[str, AfterValidator(lambda v: v.strip())]


class TournamentTimestampMixin(BaseModel):

    @field_validator(
        "start_date", "reg_start", "reg_end", mode="before", check_fields=False
    )
    @classmethod
    def ensure_utc(cls, value):
        if not value is None:
            if isinstance(value, str):
                value = datetime.fromisoformat(value)

            if value.tzinfo is None:
                return value.replace(tzinfo=timezone.utc)
            return value.astimezone(timezone.utc)
        return value


class TournamentBase(TournamentTimestampMixin):
    title: StrippedStr = Field(..., min_length=3)
    description: str
    start_date: datetime
    reg_start: datetime
    reg_end: datetime
    max_team: int = Field(..., gt=1)


class TournamentUpdate(TournamentTimestampMixin):
    title: StrippedStr | None = Field(None, min_length=3)
    description: str | None = None
    start_date: datetime | None = None
    reg_start: datetime | None = None
    reg_end: datetime | None = None
    max_team: int | None = Field(None, gt=1)

    @model_validator(mode="after")
    def validate_update_dates(self) -> Self:
        now = datetime.now(timezone.utc)

        if self.reg_start is not None and self.reg_start < now:
            raise ValueError("Registration start cannot be in the past")
        if self.reg_end is not None and self.reg_end < now:
            raise ValueError("Registration end cannot be in the past")
        if self.start_date is not None and self.start_date < now:
            raise ValueError("Tournament start cannot be in the past")

        if self.reg_start and self.reg_end and self.reg_end <= self.reg_start:
            raise ValueError("Registration end must be later than start")
        if self.reg_end and self.start_date and self.start_date <= self.reg_end:
            raise ValueError("Tournament must start after registration ends")

        return self


class TournamentCreate(TournamentBase):
    @model_validator(mode="after")
    def validate_dates(self) -> Self:
        now = datetime.now(timezone.utc)
        if self.reg_start < now:
            raise ValueError("Registration cannot start in the past")
        if self.reg_end <= self.reg_start:
            raise ValueError("Registration end must be later than start")
        if self.start_date <= self.reg_end:
            raise ValueError("Tournament must start after registration ends")
        return self


class TournamentRead(TournamentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: TournamentStatusOptionModel


class TournamentStatusOptionModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: StrippedStr = Field(..., min_length=3)
