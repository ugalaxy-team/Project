from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models import (
    JuryAssignment,
    Task,
    Submission,
    TaskEvaluationCategory,
    Team,
    SubmissionEvaluation,
    SubmissionUrl,
)
from app.dependencies import SessionDep
from fastapi import HTTPException, status


async def get_assignment(assignment_id: int, session: SessionDep) -> JuryAssignment:
    statement = (
        select(JuryAssignment)
        .where(JuryAssignment.id == assignment_id)
        .options(
            selectinload(JuryAssignment.status),
            selectinload(JuryAssignment.task).selectinload(Task.evaluation_categories),
            selectinload(JuryAssignment.task)
            .selectinload(Task.evaluation_categories)
            .selectinload(TaskEvaluationCategory.criteria),
            selectinload(JuryAssignment.submission)
            .selectinload(Submission.team)
            .selectinload(Team.members),
            selectinload(JuryAssignment.submission)
            .selectinload(Submission.team)
            .selectinload(Team.tournament),
            selectinload(JuryAssignment.submission)
            .selectinload(Submission.urls)
            .selectinload(SubmissionUrl.url),
            selectinload(JuryAssignment.evaluation).selectinload(
                SubmissionEvaluation.criterion_scores
            ),
        )
    )
    assignment = (await session.execute(statement)).scalar_one_or_none()
    if assignment is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    return assignment
