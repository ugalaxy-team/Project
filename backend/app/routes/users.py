from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select, or_, update


from app.schemas import UserPublic, UserUpdate, UserCreate
from app.models import User
from app.dependencies import CurrentUserDep, SessionDep, get_user

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=list[UserPublic])
async def users(session: SessionDep):
    statement = select(User)
    users = await session.execute(statement)
    return users.scalars().all()


@router.get("/{identifier}/", response_model=UserPublic)
async def user(identifier: int | str, session: SessionDep):
    return await get_user(identifier, session)


@router.post("/", response_model=UserPublic)
async def create_user(session: SessionDep, user_create: UserCreate):
    statement = select(User).where(
        or_(
            User.firebase_uid == user_create.firebase_uid,
            User.email == user_create.email,
        )
    )
    user = (await session.execute(statement)).scalar()
    if not user:
        user = User(**user_create.model_dump())
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user
    raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="User already exists!")


@router.patch(
    "/{identifier}/", response_model=UserPublic, status_code=status.HTTP_200_OK
)
async def edit_user(
    identifier: int | str,
    session: SessionDep,
    update_user: UserUpdate,
    current_user: CurrentUserDep,
):
    user = await get_user(identifier, session)

    if user.id != current_user.id and not current_user.is_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Permission denied")

    user_data = update_user.model_dump(exclude_unset=True)
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    if isinstance(identifier, int):
        condition = User.id == identifier
    else:
        condition = or_(User.email == identifier, User.firebase_uid == identifier)

    result = await session.execute(
        update(User).where(condition).values(**user_data).returning(User)
    )
    updated_user = result.scalar_one_or_none()

    await session.commit()
    return updated_user


@router.delete("/{identifier}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(identifier: int | str, session: SessionDep):
    user = await get_user(identifier, session)
    await session.delete(user)
    await session.commit()
