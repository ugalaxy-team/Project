from fastapi import status, HTTPException, Depends
from typing import Annotated
from sqlalchemy import select

from .current_user import CurrentUserDep
from .session import SessionDep
from app.models import User, Role


async def get_admin_user(current_user: CurrentUserDep, session: SessionDep) -> User:
    statement = (
        select(User)
        .join(User.roles)
        .where(User.id == current_user.id, Role.name == "admin")
    )
    user = (await session.execute(statement)).scalar()
    if not user:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Permission denied!")
    return user


AdminUserDep = Annotated[User, Depends(get_admin_user)]
