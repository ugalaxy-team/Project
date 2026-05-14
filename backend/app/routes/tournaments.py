from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select, update

from app.schemas import (
    TournamentPublic,
    TournamentCreate,
    TournamentUpdate,
)
from app.config import settings
from app.models import Tournament
from app.dependencies import (
    SessionDep,
    CurrentUserDep,
    TournamentOwnerDep,
    get_user,
)
from app.utils import get_tournament, tournament_load_options, get_status_by_name
from app.schemas import SubmissionPublic

router = APIRouter(prefix="/tournaments", tags=["tournaments"])


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


@router.get(
    "/{tournament_id}/submissions",
    response_model=list[SubmissionPublic],
    status_code=status.HTTP_200_OK,
)
async def submissions(tournament: Tournament = TournamentOwnerDep):
    return tournament.submissions


@router.post("/", response_model=TournamentPublic, status_code=status.HTTP_201_CREATED)
async def create_tournament(
    tournament_data: TournamentCreate,
    current_user: CurrentUserDep,
    session: SessionDep,
):
    await session.refresh(current_user, ["roles"])
    user_role_names = [role.name for role in current_user.roles]

    if not any(role in user_role_names for role in settings.TOURNAMENT_CREATOR_ROLES):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to create tournaments",
        )
    initial_status = await get_status_by_name("draft", session)

    tournament_data = tournament_data.model_dump()
    juries_ids = tournament_data.pop("juries")

    tournament = Tournament(
        **tournament_data,
        creator_id=current_user.id,
        status_id=initial_status.name,
    )
    session.add(tournament)
    await session.flush()
    await session.refresh(tournament, ["juries"])
    for jury_id in juries_ids:
        jury = await get_user(jury_id, session)
        tournament.juries.append(jury)

    await session.commit()
    tournament = await get_tournament(tournament.id, session)

    return tournament


@router.patch(
    "/{tournament_id}/",
    response_model=TournamentPublic,
    status_code=status.HTTP_200_OK,
)
async def update_tournament(
    tournament_data: TournamentUpdate,
    session: SessionDep,
    tournament: Tournament = TournamentOwnerDep,
):
    update_data = tournament_data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )
    await session.refresh(tournament, ["juries"])

    juries_ids = update_data.pop("juries", [])
    for jury_id in juries_ids:
        jury = await get_user(jury_id, session)
        tournament.juries.append(jury)
    if update_data:
        result = await session.execute(
            update(Tournament)
            .where(Tournament.id == tournament.id)
            .values(**update_data)
            .returning(Tournament)
        )
        tournament = result.scalar_one_or_none()

    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found"
        )

    await session.commit()
    await session.refresh(tournament)

    return tournament


@router.delete(
    "/{tournament_id}/",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_tournament(
    session: SessionDep,
    tournament: Tournament = TournamentOwnerDep,
):
    await session.delete(tournament)
    await session.commit()
