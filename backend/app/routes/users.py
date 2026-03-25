from fastapi import APIRouter, HTTPException, status, Depends
from typing import Annotated
from app.schemas import UserPublic
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

@router.get('/{user_id}/', response_model=UserPublic)
async def user(user_id: int, user: UserDep, session: SessionDep):
    return user