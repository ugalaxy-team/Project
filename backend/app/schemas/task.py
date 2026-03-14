from datetime import datetime, timezone
from typing_extensions import Self
from pydantic import BaseModel, Field, field_validator, model_validator


class TaskBase(BaseModel):
    title: str = Field(..., min_length=3, description="Short name of the task")
    description: str | None = Field(
        None, description="A detailed description of what needs to be done"
    )

    @field_validator("title")
    @classmethod
    def check_title(cls, value: str):
        if not value.strip():
            raise ValueError("Title cannot be empty")
        return value.strip()


class TaskUpdate(TaskBase):
    title: str | None = Field(None, min_length=3)
    description: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    tournament_id: int | None = Field(None, gt=0)
    status_id: int | None = Field(None, gt=0)


class TaskModel(TaskBase):
    start_time: datetime
    end_time: datetime
    tournament_id: int = Field(..., gt=0)
    status_id: int = Field(..., gt=0)

    @field_validator("start_time")
    @classmethod
    def start_not_past(cls, value: datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)

        if value < datetime.now(timezone.utc):
            raise ValueError("Task cannot start in the past")
        return value

    @field_validator("end_time")
    @classmethod
    def end_make_aware(cls, value: datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value

    @model_validator(mode="after")
    def check_time_logic(self) -> Self:
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be later than start_time")
        return self
