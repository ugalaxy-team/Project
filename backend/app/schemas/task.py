from datetime import datetime, timezone
from typing_extensions import Self
from pydantic import (
    BaseModel,
    Field,
    ConfigDict,
    field_validator,
    model_validator,
    ConfigDict,
)


class TaskBase(BaseModel):
    title: str = Field(..., min_length=3, description="Short name of the task")
    description: str | None = Field(
        None, description="A detailed description of what needs to be done"
    )
    start_time: datetime
    end_time: datetime
    requirements: list[str] = Field(...)

    @field_validator("title")
    @classmethod
    def check_title(cls, value: str):
        if not value.strip():
            raise ValueError("Title cannot be empty")
        return value.strip()


class TaskCreate(TaskBase):
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


class TaskUpdate(BaseModel):
    title: str | None = Field(None, min_length=3)
    description: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    requirements: list[str] | None = None


class TaskPublic(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tournament_id: int = Field(..., gt=0)
    status_id: str = Field(...)

    @field_validator("requirements", mode="before")
    @classmethod
    def transform_requirements(cls, value):
        if isinstance(value, list) and len(value) > 0 and not isinstance(value[0], str):
            return [req.name for req in value]
        return value
