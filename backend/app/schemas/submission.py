from pydantic import BaseModel, Field, ConfigDict


class SubmissionUrlOptionModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    display_name: str


class SubmissionUrlModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    url_id: str = Field(..., description="ID of the URL option")
    url_value: str = Field(..., description="The actual URL link")
    url: SubmissionUrlOptionModel | None


class SubmissionBase(BaseModel):
    team_id: int = Field(...)
    description: str = Field(None, description="Short description of the project")


class SubmissionCreate(SubmissionBase):
    urls: list[SubmissionUrlModel] = Field(..., min_length=2)


class SubmissionUpdate(BaseModel):
    description: str | None = Field(
        None, description="Short description of the project"
    )
    urls: list[SubmissionUrlModel] | None = Field(None, min_length=2)


class SubmissionPublic(SubmissionBase):
    model_config = ConfigDict(from_attributes=True)

    urls: list[SubmissionUrlModel] = Field(default_factory=list)
