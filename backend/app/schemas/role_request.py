from pydantic import BaseModel, Field, ConfigDict

from .user import UserPublic
from .role import RolePublic
from .option import OptionBase


class RoleRequestBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    role_name: str = Field(..., description="Role being requested")


class RoleRequestInfoOptionBase(OptionBase):
    model_config = ConfigDict(from_attributes=True)


class RoleRequestInfoOptionPublic(RoleRequestInfoOptionBase):
    pass


class RoleRequestInfoBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    option_name: str = Field(..., description="Request info option name")
    value: str = Field(..., description="The value of the info", max_length=4096)


class RoleReqestInfoPublic(RoleRequestInfoBase):
    id: int
    request_id: int = Field(..., description="Role request id")
    # request: 'RoleRequestPublic'
    option: "RoleRequestInfoOptionPublic"


class RoleRequestPublic(RoleRequestBase):
    id: int
    user_id: int
    user: UserPublic
    role: RolePublic
    info: list[RoleReqestInfoPublic]


class RoleRequestCreate(RoleRequestBase):
    info: list[RoleRequestInfoBase] = Field(default_factory=list)
