from pydantic import BaseModel, Field, EmailStr, field_validator
from pydantic_extra_types.phone_numbers import PhoneNumber


class TeamBase(BaseModel):
    name: str = Field(..., description="Name of the team")
    team_email: EmailStr = Field(..., description="Contact email")
    contact_info: PhoneNumber = Field(..., description="Phone number")

    @field_validator("team_email")
    @classmethod
    def normalize_email(cls, value: EmailStr):
        return value.lower()


class TeamUpdate(TeamBase):
    name: str | None = None
    team_email: EmailStr | None = None
    contact_info: PhoneNumber | None = None
    captain_id: int | None = None


class TeamModel(TeamBase):
    tournament_id: int = Field(..., gt=0)
    captain_id: int = Field(..., gt=0)

    @field_validator("team_email")
    @classmethod
    def normalize_email(cls, value: EmailStr):
        return value.lower()


class TeamMemberBase(BaseModel):
    full_name: str = Field(..., min_length=3)
    email: EmailStr = Field(..., description="Contact email")
    telegram_username: str
    educational_institution: str


class TeamMemberUpdate(TeamMemberBase):
    full_name: str | None = Field(None, min_length=3)
    email: EmailStr | None = Field(None, description="Contact email")
    telegram_username: str | None = None
    educational_institution: str | None = None
    team_id: int | None = Field(None, gt=0)


class TeamMemberModel(TeamMemberBase):
    team_id: int = Field(..., gt=0)
