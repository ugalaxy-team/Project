from pydantic import BaseModel, Field, ConfigDict
from .user import UserPublic
from .role import RolePublic

class RoleRequestBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    role_id: int = Field(..., description="Role being requested")
    user_id: int = Field(..., description="User requesting the role")

class RoleRequestPublic(RoleRequestBase):
    id: int
    user: UserPublic
    role: RolePublic

class RoleRequestCreate(RoleRequestBase):
    pass