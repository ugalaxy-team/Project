from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.schemas import TeamModel
from app.models import Team
from app.dependencies import SessionDep

router = APIRouter(prefix="/tournaments/{tournament_id}/teams")


@router.get("/", response_model=list[TeamModel], status_code=status.HTTP_200_OK)
async def tournament_participants(
    tournament_id: int,
    session: SessionDep,
):
    statement = select(Team).where(Team.tournament_id == tournament_id)
    teams = await session.execute(statement)
    return teams.scalars().all()


@router.post(
    "/",
    response_model=TeamModel,
    status_code=status.HTTP_201_CREATED,
)
async def register_team(
    team: TeamModel,
    session: SessionDep,
):
    if await session.scalar(select(Team).where(Team.name == team.name)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Team name already exists"
        )

    if await session.scalar(select(Team).where(Team.team_email == team.team_email)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Team email already exists"
        )

    if await session.scalar(select(Team).where(Team.contact_info == team.contact_info)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contact info already exists",
        )

    new_team = Team(**team.model_dump())

    session.add(new_team)

    try:
        await session.commit()
        await session.refresh(new_team)

    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=400,
            detail="Team violates unique constraints",
        )

    return new_team


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
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
            detail="Team not found in this tournament",
        )

    await session.delete(team)
    await session.commit()
