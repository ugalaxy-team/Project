from __future__ import annotations

from typing import TYPE_CHECKING

from pydantic import BaseModel, Field, EmailStr, field_validator, ConfigDict
from .role import RolePublic
from .tournament import TournamentPublicMinimal

if TYPE_CHECKING:
    from .notification import NotificationPublic


class UserBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    full_name: str = Field(..., description="Username")


class UserCreate(UserBase):
    firebase_uid: str = Field(..., description="Firebase user id")
    email: EmailStr = Field(..., description="Email")

    @field_validator("full_name")
    @classmethod
    def check_name(cls, value: str):
        if not value.strip():
            raise ValueError("The name cannot be empty")
        return value


class UserUpdate(UserBase):
    full_name: str | None = None
    email: str | None = None
    telegram: str | None = None
    github: str | None = None
    discord: str | None = None


class UserMinimalPublic(UserBase):
    """Minimal user schema without circular relationships for use in nested contexts"""

    id: int
    email: EmailStr
    firebase_uid: str
    roles: list[RolePublic]
    telegram: str | None
    github: str | None
    discord: str | None


class UserPublic(UserBase):
    id: int
    email: EmailStr
    firebase_uid: str
    roles: list[RolePublic]
    telegram: str | None
    github: str | None
    discord: str | None
    is_jury: bool
    evaluates_in: list["TournamentPublicMinimal"]


class UserModel(UserBase):
    email: EmailStr = Field(..., description="User email")

    @field_validator("email")
    @classmethod
    def check_email(cls, value: str):
        return value.lower().strip()


# Return notifications of current user only
class CurrentUser(UserPublic):
    notifications: list["NotificationPublic"]
    participates_in: list["TournamentPublicMinimal"] = Field(default_factory=list)
    created_tournaments: list["TournamentPublicMinimal"]
