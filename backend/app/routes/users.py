from fastapi import APIRouter, HTTPException, status, Depends
from typing import Annotated
from app.schemas import UserPublic
from app.models import User
from app.dependencies import SessionDep
from sqlalchemy import select

router = APIRouter(prefix='/users', tags=['users'])

async def get_user(user_id: int, session: SessionDep):
    statement = select(User).where(User.id==user_id)
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