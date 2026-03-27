from fastapi import APIRouter, HTTPException, status
from sqlalchemy.orm import selectinload
from sqlalchemy import select, update
from pydantic import ValidationError

from app.schemas import (
    TournamentRead,
    TournamentCreate,
    TournamentUpdate,
)
from app.models import Tournament, TournamentStatusOption
from app.dependencies import SessionDep

router = APIRouter(prefix="/tournaments", tags=["tournaments"])


async def get_tournament(tournament_id: int, session: SessionDep) -> Tournament:
    statement = select(Tournament).where(Tournament.id == tournament_id)
    tournament = (await session.execute(statement)).scalar_one_or_none()
    if not tournament:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Tournament not found!")
    return tournament


async def get_status_by_name(name: str, session: SessionDep) -> TournamentStatusOption:
    statement = select(TournamentStatusOption).where(
        TournamentStatusOption.name == name
    )
    status_ = (await session.execute(statement)).scalar()

    if not status_:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return status_


@router.get("/", response_model=list[TournamentRead], status_code=status.HTTP_200_OK)
async def tournaments(session: SessionDep):
    statement = select(Tournament)
    tournaments = await session.execute(statement)
    return tournaments.scalars().all()


@router.get(
    "/{tournament_id}/", response_model=TournamentRead, status_code=status.HTTP_200_OK
)
async def tournament(tournament_id: int, session: SessionDep):
    return await get_tournament(tournament_id, session)


@router.post("/", response_model=TournamentRead, status_code=status.HTTP_201_CREATED)
async def create_tournament(
    tournament: TournamentCreate,
    session: SessionDep,
):
    draft_status = await get_status_by_name("Draft", session)

    new_tournament = Tournament(
        **tournament.model_dump(),
        creator_id=1,
        status_id=draft_status.id,
    )
    session.add(new_tournament)
    await session.commit()
    await session.refresh(new_tournament)

    return new_tournament


@router.patch(
    "/{tournament_id}/", response_model=TournamentRead, status_code=status.HTTP_200_OK
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

    merged_data = {
        "title": tournament.title,
        "description": tournament.description,
        "start_date": tournament.start_date,
        "reg_start": tournament.reg_start,
        "reg_end": tournament.reg_end,
        "max_team": tournament.max_team,
        **update_data,
    }

    try:
        TournamentCreate(**merged_data)
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=e.errors()[0]["msg"],
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
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    await session.commit()
    return updated_tournament


@router.delete("/{tournament_id}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tournament(tournament_id: int, session: SessionDep):
    tournament = await get_tournament(tournament_id, session)

    await session.delete(tournament)
    await session.commit()
