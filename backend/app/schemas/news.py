from pydantic import BaseModel, Field, ConfigDict
from .datetime import DatetimePublic


class NewsBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    title: str = Field(..., description="News title")
    excerpt: str = Field(..., description="News excerpt")
    body: str = Field(..., description="News body content")
    is_important: bool = Field(default=False, description="If true, show as notification")
    category_name: str = Field(..., description="News category name")


class NewsPublic(NewsBase, DatetimePublic):
    id: int
