from fastapi import APIRouter, HTTPException, status, Depends
from typing import Annotated
from app.schemas import TournamentModels
from app.models import Tournament
from app.dependencies import SessionDep
from sqlalchemy import select

router = APIRouter(prefix='/tournaments', tags=['tournaments'])

async def get_tournament(tournament_id: int, session: SessionDep) -> Tournament:
    statement = select(Tournament).where(Tournament.id==tournament_id)
    tournament = (await session.execute(statement)).scalar()
    if not tournament:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail='Tournament not found!')
    return tournament

TournamentDep = Annotated[Tournament, Depends(get_tournament)]

@router.get('/', response_model=list[TournamentModels])
async def tournaments(session: SessionDep):
    statement = select(Tournament)
    tournaments = await session.execute(statement)
    return tournaments.all()

@router.get('/{tournament_id}/', response_model=TournamentModels)
async def tournament(tournament_id: int, session: SessionDep, tournament: TournamentDep):
    return tournament