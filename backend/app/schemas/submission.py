from pydantic import BaseModel, Field, ConfigDict


class SubmissionUrlOptionModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    display_name: str


class SubmissionUrlModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    url_id: str = Field(...)
    url: SubmissionUrlOptionModel | None


class SubmissionModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    team_id: int = Field(...)
    urls: list[SubmissionUrlModel] = Field(default_factory=list)
