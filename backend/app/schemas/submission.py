from pydantic import BaseModel, Field, ConfigDict
from .team import TeamPublic


class SubmissionUrlOptionModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    display_name: str


class SubmissionUrlModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    url_id: str = Field(..., description="ID of the URL option")
    url: SubmissionUrlOptionModel | None


class SubmissionBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    team_id: int = Field(...)


class SubmissionPublic(SubmissionBase):
    team: TeamPublic
    urls: list[SubmissionUrlModel] = Field(default_factory=list)