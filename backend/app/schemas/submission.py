from pydantic import BaseModel, Field, ConfigDict
from .team import TeamPublic


class SubmissionUrlOptionModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    display_name: str


class SubmissionUrlModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    url_id: str = Field(..., description="ID of the URL option")
    url: SubmissionUrlOptionModel | None = None
    value: str | None = None


class SubmissionCreateUrl(BaseModel):
    url_id: str
    value: str


class SubmissionCreate(BaseModel):
    team_id: int
    urls: list[SubmissionCreateUrl]


class SubmissionModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(...)
    team_id: int = Field(...)
    task_id: int = Field(...)
    team: TeamPublic | None = None
    urls: list[SubmissionUrlModel] = Field(default_factory=list)


SubmissionPublic = SubmissionModel
