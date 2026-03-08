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

@router.post('/', response_model=TournamentModels, status_code=status.HTTP_201_CREATED)
async def create_tournament(
    creator_id: int,
    status_id: int,
    tournament: TournamentModels,
    session: SessionDep,
):
    new_tournament = Tournament(
        title=tournament.title,
        description=tournament.description,
        start_date=tournament.start_date,
        reg_start=tournament.reg_start,
        reg_end=tournament.reg_end,
        max_team=tournament.max_team,
        creator_id=creator_id,
        status_id=status_id,
    )
    session.add(new_tournament)
    await session.commit()
    statement = select(Tournament).where(Tournament.id == new_tournament.id)
    created = await session.execute(statement)
    return created.first()


@router.patch('/{tournament_id}/', response_model=TournamentModels)
async def update_tournament(
    tournament_id: int,
    tournament_data: TournamentModels,
    session: SessionDep,
):
    statement = select(Tournament).where(Tournament.id == tournament_id)
    result = await session.execute(statement)
    tournament = result.scalar_one_or_none()
    if not tournament:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail='Tournament not found!')
    tournament.title = tournament_data.title
    tournament.description = tournament_data.description
    tournament.start_date = tournament_data.start_date
    tournament.reg_start = tournament_data.reg_start
    tournament.reg_end = tournament_data.reg_end
    tournament.max_team = tournament_data.max_team
    await session.commit()
    return tournament


@router.delete('/{tournament_id}/', status_code=status.HTTP_204_NO_CONTENT)
async def delete_tournament(tournament_id: int, session: SessionDep):
    statement = select(Tournament).where(Tournament.id == tournament_id)
    result = await session.execute(statement)
    tournament = result.scalar_one_or_none()
    if not tournament:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail='Tournament not found!')
    await session.delete(tournament)
    await session.commit()


@router.post('/{tournament_id}/register', response_model=TeamModel, status_code=status.HTTP_201_CREATED)
async def register_team(
    tournament_id: int,
    team: TeamModel,
    session: SessionDep,
):
    new_team = Team(
        name=team.name,
        team_email=team.team_email,
        contact_info=str(team.contact_info),
        tournament_id=tournament_id,
        captain_id=team.captain_id,
    )
    session.add(new_team)
    await session.commit()
    statement = select(Team).where(Team.id == new_team.id)
    created = await session.execute(statement)
    return created.first()


@router.post('/{tournament_id}/leave', status_code=status.HTTP_204_NO_CONTENT)
async def leave_tournament(
    tournament_id: int,
    team_id: int,
    session: SessionDep,
):
    statement = select(Team).where(
        Team.id == team_id,
        Team.tournament_id == tournament_id,
    )
    result = await session.execute(statement)
    team = result.scalar_one_or_none()
    if not team:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail='Team not found in this tournament',
        )
    await session.delete(team)
    await session.commit()


@router.get('/{tournament_id}/participants', response_model=list[TeamModel])
async def tournament_participants(
    tournament_id: int,
    session: SessionDep,
):
    statement = select(Team).where(Team.tournament_id == tournament_id)
    teams = await session.execute(statement)
    return teams.all()

