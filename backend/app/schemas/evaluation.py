from pydantic import BaseModel, Field, ConfigDict


class RequirementEvaluationModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    score: int = Field(..., ge=0)


class SubmissionEvaluationModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    submission_id: int = Field(..., gt=0)
    jury_id: int = Field(..., gt=0)
