from fastapi import APIRouter, HTTPException, status
from app.schemas import UserModel
from app.models import User
from app.dependencies import SessionDep
from sqlalchemy import select

router = APIRouter(prefix='/users', tags=['users'])

@router.get('/', response_model=list[UserModel])
async def users(session: SessionDep):
    statement = select(User)
    users = await session.execute(statement)
    return users.all()

@router.get('/{user_id}/', response_model=UserModel)
async def user(user_id: int, session: SessionDep):
    statement = select(User).where(User.id==user_id)
    user = await session.execute(statement)
    if not user.first():
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail='User not found!')
    return user.first()