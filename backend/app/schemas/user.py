from typing import List
from pydantic import BaseModel, Field, EmailStr, field_validator


class UserModel(BaseModel):
    id: int
    full_name: str = Field(..., description="Username")
    email: EmailStr = Field(..., description="User email")
    password: str = Field(..., min_length=6, description="User password")
    role: List[str]

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
