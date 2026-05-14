from __future__ import annotations

from typing import TYPE_CHECKING

from pydantic import BaseModel, Field, EmailStr, field_validator, ConfigDict
from pydantic_extra_types.phone_numbers import PhoneNumber

from .tournament import TournamentPublicMinimal

if TYPE_CHECKING:
    from .tournament import TournamentPublic


class TeamMemberBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    full_name: str = Field(..., min_length=3)
    email: EmailStr = Field(..., description="Contact email")
    telegram: str
    educational_institution: str | None = None


class TeamMemberCreate(TeamMemberBase):
    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr):
        return value.lower()


class TeamMemberUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=3)
    email: EmailStr | None = Field(None, description="Contact email")
    telegram: str | None = None
    educational_institution: str | None = None

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str | None):
        return value.lower().strip() if value else value


class TeamMemberPublic(TeamMemberBase):
    pass

class TeamBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str = Field(..., description="Name of the team")
    team_email: EmailStr = Field(..., description="Contact email")
    contact_info: PhoneNumber = Field(..., description="Phone number")


class TeamCreate(TeamBase):
    captain: TeamMemberPublic
    members: list[TeamMemberPublic] = Field(..., min_length=1)

    @field_validator("team_email")
    @classmethod
    def normalize_email(cls, value: str):
        return value.lower().strip()


class TeamUpdate(BaseModel):
    name: str | None = None
    team_email: EmailStr | None = None
    contact_info: PhoneNumber | None = None

    @field_validator("team_email")
    @classmethod
    def normalize_email(cls, value: str | None):
        return value.lower().strip() if value else value


class TeamPublic(TeamBase):
    tournament: "TournamentPublicMinimal"
    members: list[TeamMemberPublic]
