from fastapi import APIRouter, HTTPException, status
from sqlalchemy.orm import selectinload
from sqlalchemy import select, update

from app.schemas import (
    TournamentPublic,
    TournamentCreate,
    TournamentUpdate,
)
from app.config import settings
from app.models import Team, Tournament, User
from app.dependencies import SessionDep, CurrentUserDep
from app.utils.routes.dates_logic import (
    validate_dates_on_create,
    validate_dates_on_update,
)
from app.utils.fsm import auto_update_tournament_status, get_status_by_name

router = APIRouter(prefix="/tournaments", tags=["tournaments"])

tournament_load_options = (
    selectinload(Tournament.status),
    selectinload(Tournament.creator).selectinload(User.roles),
    selectinload(Tournament.tasks),
    selectinload(Tournament.teams).selectinload(Team.members),
)


# for future , move to a separate file: get_tournament, get_status_by_name
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


@router.get("/", response_model=list[TournamentPublic], status_code=status.HTTP_200_OK)
async def tournaments(session: SessionDep):
    statement = select(Tournament).options(*tournament_load_options)
    tournaments = await session.execute(statement)
    return tournaments.scalars().all()


@router.get(
    "/{tournament_id}/", response_model=TournamentPublic, status_code=status.HTTP_200_OK
)
async def tournament(tournament_id: int, session: SessionDep):
    return await get_tournament(tournament_id, session)


@router.post("/", response_model=TournamentPublic, status_code=status.HTTP_201_CREATED)
async def create_tournament(
    tournament: TournamentCreate, session: SessionDep, user: CurrentUserDep
):
    user_role_names = [role.name for role in user.roles]

    if not any(role in user_role_names for role in settings.TOURNAMENT_CREATOR_ROLES):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to create tournaments",
        )
    initial_status = await get_status_by_name("draft", session)

    validate_dates_on_create(
        start_date=tournament.start_date,
        reg_start=tournament.reg_start,
        reg_end=tournament.reg_end,
    )

    new_tournament = Tournament(
        **tournament.model_dump(),
        creator_id=user.id,
        status_id=initial_status.name,
    )
    session.add(new_tournament)
    await session.commit()
    await session.refresh(new_tournament)

    return new_tournament


@router.patch(
    "/{tournament_id}/", response_model=TournamentPublic, status_code=status.HTTP_200_OK
)
async def update_tournament(
    tournament_id: int,
    tournament_data: TournamentUpdate,
    session: SessionDep,
):
    update_data = tournament_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    tournament = await get_tournament(tournament_id, session)

    start_date = update_data.get("start_date", tournament.start_date)
    reg_start = update_data.get("reg_start", tournament.reg_start)
    reg_end = update_data.get("reg_end", tournament.reg_end)

    validate_dates_on_update(
        start_date=start_date,
        reg_start=reg_start,
        reg_end=reg_end,
    )

    result = await session.execute(
        update(Tournament)
        .where(Tournament.id == tournament_id)
        .values(**update_data)
        .returning(Tournament)
    )
    updated_tournament = result.scalar_one_or_none()

    if not updated_tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found"
        )

    await session.commit()
    return updated_tournament


@router.delete("/{tournament_id}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tournament(tournament_id: int, session: SessionDep):
    tournament = await get_tournament(tournament_id, session)

    await session.delete(tournament)
    await session.commit()
