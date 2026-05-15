from fastapi import status, HTTPException
from fastapi.routing import APIRouter
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError

from app.dependencies import SessionDep
from app.models import TeamMember
from app.schemas import TeamMemberCreate, TeamMemberPublic, TeamMemberUpdate
from app.utils import get_team, check_registration_open, get_tournament

router = APIRouter(
    prefix="/tournaments/{tournament_id}/teams/{team_id}/members", tags=["team-members"]
)


async def get_team_member(member_id: int, team_id: int, session: SessionDep) -> TeamMember:
    statement = select(TeamMember).where(
        TeamMember.id == member_id, TeamMember.team_id == team_id
    )

    member = (await session.execute(statement)).scalar_one_or_none()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found!",
        )

    return member


@router.get("/", response_model=list[TeamMemberPublic], status_code=status.HTTP_200_OK)
async def team_members(tournament_id: int, team_id: int, session: SessionDep):
    await get_team(team_id, tournament_id, session)

    statement = select(TeamMember).where(TeamMember.team_id == team_id)
    result = await session.execute(statement)
    return result.scalars().all()


@router.get("/{member_id}/", response_model=TeamMemberPublic, status_code=status.HTTP_200_OK)
async def team_member(tournament_id: int, team_id: int, member_id: int, session: SessionDep):
    await get_team(team_id, tournament_id, session)

    return await get_team_member(member_id, team_id, session)


@router.post("/", response_model=TeamMemberPublic, status_code=status.HTTP_201_CREATED)
async def create_team_member(
    tournament_id: int, team_id: int, member_data: TeamMemberCreate, session: SessionDep
):
    await get_team(team_id, tournament_id, session)

    new_member = TeamMember(
        **member_data.model_dump(),
        team_id=team_id,
    )

    session.add(new_member)

    try:
        await session.commit()
        await session.refresh(new_member)

    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or telegram already exists",
        )

    return new_member


@router.patch("/{member_id}/", response_model=TeamMemberPublic, status_code=status.HTTP_200_OK)
async def update_team_member(
    tournament_id: int,
    team_id: int,
    member_id: int,
    member_data: TeamMemberUpdate,
    session: SessionDep,
):
    await get_team(team_id, tournament_id, session)

    update_data = member_data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No fields provided"
        )

    result = await session.execute(
        select(TeamMember).where(
            TeamMember.id == member_id,
            TeamMember.team_id == team_id,
        )
    )

    member = result.scalar_one_or_none()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Team member not found"
        )

    await session.execute(
        update(TeamMember)
        .where(
            TeamMember.id == member_id,
            TeamMember.team_id == team_id,
        )
        .values(**update_data)
    )
    try:
        await session.commit()
        await session.refresh(member)

    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or telegram already exists",
        )

    return member


@router.delete("/{member_id}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_team_member(
    tournament_id: int, team_id: int, member_id: int, session: SessionDep
):
    tournament = await get_tournament(tournament_id, session)
    check_registration_open(tournament)

    team = await get_team(team_id, tournament_id, session)
    member = await get_team_member(member_id, team_id, session)

    if member.id == team.captain_id:
        raise HTTPException(400, "Cannot delete captain")

    await session.delete(member)
    await session.commit()
