from pydantic import BaseModel, Field, EmailStr, field_validator, ConfigDict
from .role import RolePublic

class UserBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    full_name: str = Field(..., description="Username")

    @field_validator("full_name")
    @classmethod
    def check_name(cls, value: str):
        if not value.strip():
            raise ValueError("The name cannot be empty")
        return value
    
class UserCreate(UserBase):
    firebase_uid: str = Field(..., description='Firebase user id')
    email: EmailStr = Field(..., description='Email')

class UserUpdate(UserBase):
    full_name: str | None = None
    email: str | None = None
    telegram: str | None = None
    github: str | None = None
    discord: str | None = None

class UserPublic(UserBase):
    id: int
    email: EmailStr
    firebase_uid: str
    roles: list[RolePublic]
    telegram: str | None
    github: str | None
    discord: str | None

class UserModel(UserBase):
    email: EmailStr = Field(..., description="User email")

    @field_validator("email")
    @classmethod
    def check_email(cls, value: str):
        return value.lower().strip()

from .role_request import RoleRequestPublic
from .notification import NotificationPublic
# Return notifications of current user only
# TODO: add created_tournaments after the TournamentPublic model will be defined
class CurrentUser(UserPublic):
    notifications: list[NotificationPublic]
    role_requests: list[RoleRequestPublic]