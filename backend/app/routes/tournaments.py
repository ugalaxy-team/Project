from fastapi import APIRouter, HTTPException, status
from app.schemas import TournamentModels
from app.models import Tournament
from app.dependencies import SessionDep
from sqlalchemy import select

router = APIRouter(prefix='/tournaments', tags=['tournaments'])

@router.get('/', response_model=list[TournamentModels])
async def tournaments(session: SessionDep):
    statement = select(Tournament)
    tournaments = await session.execute(statement)
    return tournaments.all()

@router.get('/{tournament_id}/', response_model=TournamentModels)
async def tournament(tournament_id: int, session: SessionDep):
    statement = select(Tournament).where(Tournament.id==tournament_id)
    tournament = await session.execute(statement)
    if not tournament.first():
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail='Tournament not found!')
    return tournament.first()