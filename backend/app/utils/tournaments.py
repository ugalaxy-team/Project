from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.dependencies.session import SessionDep
from app.models import Tournament, Team, User
from .fsm import auto_update_tournament_status

tournament_load_options = (
    selectinload(Tournament.status),
    selectinload(Tournament.creator).selectinload(User.roles),
    selectinload(Tournament.tasks),
    selectinload(Tournament.teams).selectinload(Team.members),
    selectinload(Tournament.juries),
)


async def get_tournament(tournament_id: int, session: SessionDep) -> Tournament:
    statement = (
        select(Tournament)
        .where(Tournament.id == tournament_id)
        .options(*tournament_load_options)
    )
    tournament = (await session.execute(statement)).scalar_one_or_none()
    if not tournament:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Tournament not found!")

    await auto_update_tournament_status(tournament, session)

    return tournament
