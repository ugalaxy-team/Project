from fastapi import APIRouter, HTTPException, status, Depends
from typing import Annotated
from app.schemas import UserPublic, UserUpdate
from app.models import User
from app.dependencies import SessionDep
from sqlalchemy import select, or_

router = APIRouter(prefix='/users', tags=['users'])

async def get_user(identifier: str | int, session: SessionDep):
    if isinstance(identifier, str):
        statement = select(User).where(or_(User.firebase_uid==identifier, User.email==identifier))
    elif isinstance(identifier, int):
        statement = select(User).where(User.id==identifier)
    else:
        raise ValueError('Wrong user identifier type')
    user = (await session.execute(statement)).scalar()
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail='User not found!')
    return user

UserDep = Annotated[User, Depends(get_user)]

@router.get('/', response_model=list[UserPublic])
async def users(session: SessionDep):
    statement = select(User)
    users = await session.execute(statement)
    return users.scalars().all()

@router.patch('/{identifier}/', response_model=UserPublic)
async def edit_user(identifier: int | str, session: SessionDep, update_user: UserUpdate):
    user_data = update_user.model_dump(exclude_unset=True)
    user = await get_user(identifier, session)
    user.full_name = user_data.get('full_name', user.full_name)
    user.email = user_data.get('email', user.email)
    await session.commit()
    await session.refresh(user)
    return user

@router.delete('/{identifier}/', status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(identifier: int | str, session: SessionDep):
    user = await get_user(identifier, session)
    await session.delete(user)
    await session.commit()

@router.get('/{identifier}/', response_model=UserPublic)
async def user(identifier: int | str, session: SessionDep):
    return await get_user(identifier, session)