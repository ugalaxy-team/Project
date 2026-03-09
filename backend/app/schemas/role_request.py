from pydantic import BaseModel, Field, field_validator


class RoleRequestBase(BaseModel):
    role_id: int = Field(..., description="Role being requested")
    user_id: int = Field(..., description="User requesting the role")

class RoleRequestPublic(RoleRequestBase):
    role: str
    user: str

class RoleRequestCreate(RoleRequestBase):
    pass