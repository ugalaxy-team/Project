from __future__ import annotations

from typing import TYPE_CHECKING

from pydantic import BaseModel, Field, EmailStr, field_validator, ConfigDict
from pydantic_extra_types.phone_numbers import PhoneNumber

if TYPE_CHECKING:
    from .tournament import TournamentPublic


class TeamMemberBase(BaseModel):
    full_name: str = Field(..., min_length=3)
    email: EmailStr = Field(..., description="Contact email")
    telegram_username: str
    educational_institution: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr):
        return value.lower()


class TeamMemberCreate(BaseModel):
    pass


class TeamMemberUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=3)
    email: EmailStr | None = Field(None, description="Contact email")
    telegram_username: str | None = None
    educational_institution: str | None = None


class TeamMemberPublic(BaseModel):
    pass


class TeamBase(BaseModel):
    name: str = Field(..., description="Name of the team")
    team_email: EmailStr = Field(..., description="Contact email")
    contact_info: PhoneNumber = Field(..., description="Phone number")

    @field_validator("team_email")
    @classmethod
    def normalize_email(cls, value: EmailStr):
        return value.lower()


class TeamUpdate(BaseModel):
    name: str | None = None
    team_email: EmailStr | None = None
    contact_info: PhoneNumber | None = None


class TeamModel(TeamBase):
    captain: TeamMemberPublic
    members: list[TeamMemberPublic] = Field(..., min_length=1)


class TeamPublic(TeamBase):
    tournament: "TournamentPublic"
    members: list[TeamMemberPublic]
