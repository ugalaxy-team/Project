from fastapi import status, HTTPException
from fastapi.routing import APIRouter
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from app.dependencies import SessionDep
from app.models import Team
from app.schemas import TeamModel, TeamUpdate

router = APIRouter(prefix="/teams", tags=["teams"])


async def get_team(team_id: int, session: SessionDep) -> Team:
    statement = select(Team).where(Team.id == team_id)
    team = (await session.execute(statement)).scalar()
    if not team:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Team not found!")
    return team


@router.get("/", response_model=list[TeamModel], status_code=status.HTTP_200_OK)
async def teams(session: SessionDep):
    statement = select(Team)
    teams = await session.execute(statement)
    return teams.scalars().all()


@router.get("/{team_id}/", response_model=TeamModel, status_code=status.HTTP_200_OK)
async def team(team_id: int, session: SessionDep):
    return await get_team(team_id, session)


@router.post("/", response_model=TeamModel, status_code=status.HTTP_201_CREATED)
async def create_team(team_data: TeamModel, session: SessionDep):
    new_team = Team(**team_data.model_dump())
    session.add(new_team)

    try:
        await session.commit()
        await session.refresh(new_team)
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team with this name, email or phone number already exists",
        )

    return new_team


@router.patch("/{team_id}/", response_model=TeamModel, status_code=status.HTTP_200_OK)
async def update_team(team_id: int, team_data: TeamUpdate, session: SessionDep):
    update_data = team_data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    try:
        result = await session.execute(
            update(Team).where(Team.id == team_id).values(**update_data).returning(Team)
        )
        updated_team = result.scalar_one_or_none()

        if not updated_team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Team not found"
            )

        await session.commit()
        await session.refresh(updated_team)

    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team with this name, email, or phone number already exists",
        )

    return updated_team


@router.delete("/{team_id}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_team(team_id: int, session: SessionDep):
    team = await get_team(team_id, session)

    await session.delete(team)
    await session.commit()
