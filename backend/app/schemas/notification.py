from pydantic import BaseModel, Field, field_validator, ConfigDict


class NotificationBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    body: str = Field(..., description="Notification body")
    user_id: int | None = Field(None, description="Notification receiver id")

from .user import UserPublic
class NotificationPublic(NotificationBase):
    user: UserPublic | None = Field(None, description='Notification receiver')

class NotificationCreate(NotificationBase):
    @field_validator("body")
    @classmethod
    def check_body(cls, value: str):
        if not value.strip():
            raise ValueError("The body cannot be empty")
        if len(value.strip()) > 4096:
            raise ValueError('The body cannot be longer than 4096 characters')
        return value
