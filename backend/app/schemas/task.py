from datetime import datetime, timezone
from typing import Annotated
from typing_extensions import Self
from pydantic import (
    BaseModel,
    Field,
    ConfigDict,
    field_validator,
    model_validator,
    AfterValidator,
)


def make_naive(value: datetime) -> datetime:
    if value.tzinfo is not None:
        return value.astimezone(timezone.utc).replace(tzinfo=None)
    return value


NaiveDatetime = Annotated[datetime, AfterValidator(make_naive)]
StrippedStr = Annotated[str, AfterValidator(lambda v: v.strip())]


class TaskBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    title: StrippedStr = Field(..., min_length=3, description="Short name of the task")
    description: str | None = Field(
        None, description="A detailed description of what needs to be done"
    )
    start_time: NaiveDatetime
    end_time: NaiveDatetime
    requirements: list[str] = Field(...)


class TaskEvaluationCriterionCreate(BaseModel):
    name: str
    description: str | None = None
    weight: int = 1
    max_score: int = 10


class TaskCreate(TaskBase):
    criteria: list[TaskEvaluationCriterionCreate] = []

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
    title: StrippedStr | None = Field(None, min_length=3)
    description: str | None = None
    start_time: NaiveDatetime | None = None
    end_time: NaiveDatetime | None = None
    requirements: list[str] | None = None
    criteria: list[TaskEvaluationCriterionCreate] | None = None


class TaskEvaluationCriterionPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_id: int
    name: str
    description: str | None
    weight: int
    max_score: int

    @model_validator(mode="after")
    def check_update_dates(self) -> Self:
        if self.start_time and self.end_time:
            if self.end_time <= self.start_time:
                raise ValueError("end_time must be later than start_time")
        return self


class TaskPublic(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tournament_id: int = Field(..., gt=0)
    status_id: str = Field(...)
    criteria: list["TaskEvaluationCriterionPublic"] = []

    @field_validator("requirements", mode="before")
    @classmethod
    def transform_requirements(cls, value):
        if isinstance(value, list) and len(value) > 0 and not isinstance(value[0], str):
            return [req.name for req in value]
        return value
