from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from .submission import SubmissionPublic
from .task import TaskPublic
from .datetime import DatetimePublic


class CriterionScoreBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    criterion_id: int = Field(..., gt=0)
    score: int = Field(..., ge=0)


class CriterionScoreCreate(CriterionScoreBase):
    pass


class CriterionScorePublic(CriterionScoreBase):
    id: int


class SubmissionEvaluationBase(BaseModel):
    comment: str | None = None


class SubmissionEvaluationCreate(SubmissionEvaluationBase):
    criterion_scores: list[CriterionScoreCreate] = Field([], min_length=1)


class SubmissionEvaluationUpdate(SubmissionEvaluationBase):
    comment: str | None = None
    criterion_scores: list[CriterionScoreCreate] = Field([], min_length=1)


class SubmissionEvaluationPublic(SubmissionEvaluationBase):
    id: int
    assignment_id: int
    submission_id: int
    jury_id: int
    comment: str | None
    created_at: datetime | None
    criterion_scores: list[CriterionScorePublic] = Field(default_factory=list)


class JuryAssignmentStatusPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    display_name: str


class JuryAssignmentBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_id: int
    submission_id: int
    jury_id: int
    status_id: str


class JuryAssignmentPublic(JuryAssignmentBase):
    status: JuryAssignmentStatusPublic
    submission: SubmissionPublic
    task: TaskPublic
    evaluation: SubmissionEvaluationPublic | None = None


class EvaluationLeaderboardEntry(BaseModel):
    submission_id: int
    team_id: int
    team_name: str
    average_score: float
    total_score: float
    submitted_reviews: int


class FinishEvaluationResponse(BaseModel):
    task_id: int
    status_id: str
