from pydantic import Field, field_validator, ConfigDict
from .option import OptionBase, OptionUpdate


class RoleBase(OptionBase):
    model_config = ConfigDict(from_attributes=True)

    description: str = Field(..., description="Role description")


class RoleUpdate(OptionUpdate):
    description: str | None = None


class RolePublic(RoleBase):
    pass


class RoleCreate(RoleBase):
    @field_validator("name")
    @classmethod
    def check_name(cls, value: str):
        if not value.strip():
            raise ValueError("The name cannot be empty")
        return value
