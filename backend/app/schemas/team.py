from pydantic import BaseModel, Field, EmailStr, field_validator, ConfigDict
from pydantic_extra_types.phone_numbers import PhoneNumber


class TeamModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    name: str = Field(..., description="Name of the team")
    team_email: EmailStr = Field(..., description="Contact email")
    contact_info: PhoneNumber = Field(..., description="Phone number")
    tournament_id: int = Field(..., gt=0)
    captain_id: int = Field(..., gt=0)

    @field_validator("team_email")
    @classmethod
    def normalize_email(cls, value: EmailStr):
        return value.lower()


class TeamMemberModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    full_name: str = Field(..., min_length=3)
    email: EmailStr = Field(..., description="Contact email")
    telegram: str
    educational_institution: str
    team_id: int = Field(..., gt=0)
