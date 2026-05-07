from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models import Team, Task
from app.config import settings
from app.dependencies import SessionDep


async def check_submission_deadline(team_id: int, session: SessionDep) -> Team:
    team_stmt = (
        select(Team).where(Team.id == team_id).options(selectinload(Team.tournament))
    )
    result = await session.execute(team_stmt)
    team = result.scalar_one_or_none()

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found",
        )

    task_stmt = select(Task).where(
        Task.tournament_id == team.tournament_id,
        Task.status_id.in_(
            [
                settings.TASK_STATUS_NAMES.ACTIVE,
                settings.TASK_STATUS_NAMES.SUBMISSION_CLOSED,
            ]
        ),
    )
    result = await session.execute(task_stmt)
    relevant_tasks = result.scalars().all()

    active_task = next(
        (t for t in relevant_tasks if t.status_id == settings.TASK_STATUS_NAMES.ACTIVE),
        None,
    )

    if not active_task:
        any_closed = any(
            t.status_id == settings.TASK_STATUS_NAMES.SUBMISSION_CLOSED
            for t in relevant_tasks
        )
        detail = (
            "Submission deadline has passed."
            if any_closed
            else "No active task. Submissions are not yet open."
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
        )

    return team
