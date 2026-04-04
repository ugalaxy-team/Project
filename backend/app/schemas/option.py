from pydantic import BaseModel, Field, ConfigDict

class OptionBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(..., description='Option name')
    display_name: str = Field(..., description='Option description')
    
class OptionUpdate(OptionBase):
    name: str | None = None
    display_name: str | None = None
    