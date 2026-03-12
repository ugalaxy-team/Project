from pydantic import BaseModel, Field, field_validator, ConfigDict

class RoleBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    name: str = Field(..., description="Role name")


class RoleUpdate(RoleBase):
    name: str | None = None

class RolePublic(RoleBase):
    pass

class RoleCreate(RoleBase):

    @field_validator("name")
    @classmethod
    def check_name(cls, value: str):
        if not value.strip():
            raise ValueError("The name cannot be empty")
        return value
