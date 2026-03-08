from pydantic import BaseModel, Field, field_validator


class NotificationModel(BaseModel):
    body: str = Field(..., description="Notification body")
    user: str

    @field_validator("body")
    @classmethod
    def check_body(cls, value: str):
        if not value.strip():
            raise ValueError("The body cannot be empty")
        if len(value.strip()) > 4096:
            raise ValueError('The body cannot be longer than 4096 characters')
        return value
