from typing import List
from pydantic import BaseModel, Field, EmailStr, field_validator

from ..models import Role


class UserModel(BaseModel):
    id: int
    full_name: str = Field(..., description="Username")
    email: EmailStr = Field(..., description="User email")
    password: str = Field(..., min_length=6, description="User password")
    role: List[Role]
