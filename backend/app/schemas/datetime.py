from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class DatetimeBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    created_at: datetime = Field(..., description='Created at')
    updated_at: datetime = Field(..., description='Updated at')
    
class DatetimePublic(DatetimeBase):
    pass