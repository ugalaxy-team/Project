from pydantic import BaseModel, Field


class RequirementEvaluationModel(BaseModel):
    score: int = Field(..., ge=0)


class SubmissionEvaluationModel(BaseModel):
    submission_id: int = Field(..., gt=0)
    jury_id: int = Field(..., gt=0)
