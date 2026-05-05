from fastapi import HTTPException, status
from sqlalchemy import select
from app.dependencies.session import SessionDep
from app.models import User 

async def get_user_by_email(email: str, session: SessionDep):
    statement = select(User).where(User.email == email)

    user = (await session.execute(statement)).scalar()
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found!")
    return user


async def get_user_by_firebase_uid(firebase_uid: str, session: SessionDep):
    statement = select(User).where(User.firebase_uid == firebase_uid)

    user = (await session.execute(statement)).scalar()
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found!")
    return user


async def get_user_by_id(id: int, session: SessionDep):
    statement = select(User).where(User.id == id)

    user = (await session.execute(statement)).scalar()
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found!")
    return user
