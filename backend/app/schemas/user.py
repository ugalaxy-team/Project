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

class UserUpdate(UserBase):
    full_name: str | None = None

class UserPublic(UserBase):
    email: EmailStr
    roles: list[RolePublic]

class UserModel(UserBase):
    email: EmailStr = Field(..., description="User email")
    password: str = Field(..., description="User password")

    @field_validator("email")
    @classmethod
    def check_email(cls, value: str):
        return value.lower().strip()

# Return notifications of current user only
class CurrentUser(UserPublic):
    notifications: list[str]