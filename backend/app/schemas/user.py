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