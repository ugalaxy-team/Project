from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models import Team, Tournament
from app.dependencies import SessionDep


async def check_submission_deadline(team_id: int, session: SessionDep) -> Team:
    statement = (
        select(Team)
        .where(Team.id == team_id)
        .options(selectinload(Team.tournament).selectinload(Tournament.tasks))
    )
    result = await session.execute(statement)
    team = result.scalar_one_or_none()

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Team not found"
        )

    active_task = team.tournament.active_task

    if not active_task:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Submissions are blocked. The deadline has passed or no active task exists.",
        )

    return team
