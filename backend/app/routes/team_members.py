from fastapi import status, HTTPException
from fastapi.routing import APIRouter
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError

from app.dependencies import SessionDep
from app.models import TeamMember
from app.schemas import TeamMemberModel, TeamMemberUpdate

router = APIRouter(prefix="/team-members", tags=["team-members"])


async def get_team_member(member_id: int, session: SessionDep) -> TeamMember:
    statement = select(TeamMember).where(TeamMember.id == member_id)
    member = (await session.execute(statement)).scalar()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found!",
        )

    return member


@router.get("/", response_model=list[TeamMemberModel], status_code=status.HTTP_200_OK)
async def team_members(session: SessionDep):
    statement = select(TeamMember)
    result = await session.execute(statement)
    return result.scalars().all()


@router.get("/{member_id}/", response_model=TeamMemberModel, status_code=status.HTTP_200_OK)
async def team_member(member_id: int, session: SessionDep):
    return await get_team_member(member_id, session)


@router.post("/", response_model=TeamMemberModel, status_code=status.HTTP_201_CREATED)
async def create_team_member(member_data: TeamMemberModel, session: SessionDep):
    new_member = TeamMember(**member_data.model_dump())
    session.add(new_member)

    try:
        await session.commit()
        await session.refresh(new_member)
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or telegram username already exists",
        )

    return new_member


@router.patch("/{member_id}/", response_model=TeamMemberModel, status_code=status.HTTP_200_OK)
async def update_team_member(
    member_id: int, member_data: TeamMemberUpdate, session: SessionDep
):
    update_data = member_data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    try:
        result = await session.execute(
            update(TeamMember)
            .where(TeamMember.id == member_id)
            .values(**update_data)
            .returning(TeamMember)
        )

        updated_member = result.scalar_one_or_none()

        if not updated_member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team member not found",
            )

        await session.commit()
        await session.refresh(updated_member)

    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or telegram username already exists",
        )

    return updated_member


@router.delete("/{member_id}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_team_member(member_id: int, session: SessionDep):
    member = await get_team_member(member_id, session)

    await session.delete(member)
    await session.commit()
