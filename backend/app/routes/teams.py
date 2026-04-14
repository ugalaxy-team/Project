from datetime import datetime, timezone
from fastapi import status, HTTPException
from fastapi.routing import APIRouter
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError

from app.dependencies import SessionDep
from app.models import Team
from app.schemas import TeamModel, TeamUpdate
from app.utils.routes import (
    get_tournament,
    check_registration_open,
    get_team,
    validate_team_registration,
    create_team_record,
)

router = APIRouter(prefix="/tournaments/{tournament_id}/teams", tags=["teams"])


@router.get("/", response_model=list[TeamModel], status_code=status.HTTP_200_OK)
async def teams(tournament_id: int, session: SessionDep):
    await get_tournament(tournament_id, session)

    statement = (
        select(Team)
        .where(Team.tournament_id == tournament_id)
        .options(selectinload(Team.members), selectinload(Team.captain))
    )

    result = await session.execute(statement)
    return result.scalars().all()


@router.get("/{team_id}/", response_model=TeamModel, status_code=status.HTTP_200_OK)
async def team(team_id: int, tournament_id: int, session: SessionDep):
    return await get_team(team_id, tournament_id, session)


@router.post("/", response_model=TeamModel, status_code=status.HTTP_201_CREATED)
async def create_team(tournament_id: int, team_data: TeamModel, session: SessionDep):

    tournament = await get_tournament(tournament_id, session)
    check_registration_open(tournament)

    await validate_team_registration(tournament, team_data, session)

    try:
        new_team = await create_team_record(tournament_id, team_data, session)
        await session.commit()
    except IntegrityError as e:
        await session.rollback()
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, detail=f"Registration failed: {str(e.orig)}"
        )

    statement = (
        select(Team)
        .where(Team.id == new_team.id)
        .options(selectinload(Team.members), selectinload(Team.captain))
    )
    result = await session.execute(statement)
    return result.scalar_one_or_none()


@router.patch("/{team_id}/", response_model=TeamModel, status_code=status.HTTP_200_OK)
async def update_team(
    team_id: int, tournament_id: int, team_data: TeamUpdate, session: SessionDep
):
    tournament = await get_tournament(tournament_id, session)

    if datetime.now(timezone.utc) > tournament.reg_end.replace(tzinfo=timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Editing is forbidden after registration ends",
        )

    await get_team(team_id, tournament_id, session)

    update_data = team_data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    await session.execute(
        update(Team)
        .where(Team.id == team_id, Team.tournament_id == tournament_id)
        .values(**update_data)
    )

    try:
        await session.commit()

    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Update violates constraints",
        )

    statement = (
        select(Team)
        .where(Team.id == team_id)
        .options(selectinload(Team.members), selectinload(Team.captain))
    )

    result = await session.execute(statement)
    return result.scalar_one_or_none()


@router.delete("/{team_id}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_team(team_id: int, tournament_id: int, session: SessionDep):
    tournament = await get_tournament(tournament_id, session)

    if datetime.now(timezone.utc) > tournament.reg_end.replace(tzinfo=timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Deletion is forbidden"
        )

    team = await get_team(team_id, tournament_id, session)

    await session.delete(team)
    await session.commit()
