from datetime import datetime
from typing_extensions import Self
from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict


class TaskModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    title: str = Field(..., min_length=3, description="Short name of the task")
    description: str = Field(
        description="A detailed description of what needs to be done"
    )
    start_time: datetime
    end_time: datetime
    tournament_id: int = Field(..., gt=0)
    status_id: str = Field(..., gt=0)

    @field_validator("title")
    @classmethod
    def check_title(cls, value: str):
        return value.strip()

    @field_validator("start_time")
    @classmethod
    def start_not_past(cls, value: datetime):
        if value < datetime.now():
            raise ValueError("Task cannot start in the past")
        return value

    @model_validator(mode="after")
    def check_time_logic(self) -> Self:
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be later than start_time")
        return self
