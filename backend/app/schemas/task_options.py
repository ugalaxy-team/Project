from pydantic import BaseModel, Field


class TaskRequirementOptionCreate(BaseModel):
    name: str = Field(..., min_length=1, description="Technical ID (e.g. “fastapi”)")
    display_name: str = Field(
        ..., min_length=1, description="A human-readable name (e.g., “FastAPI”)"
    )
    category_id: str = Field(..., description="ID of an existing category")


class TaskRequirementOptionPublic(TaskRequirementOptionCreate):
    pass
