import asyncio

from app.models import User
from firebase_admin import auth
from app.dependencies import SessionDep
from fastapi import HTTPException, status
from app.routes.users import get_user
from app.config import settings

async def get_or_create_user_from_token(token: dict, session: SessionDep) -> User:
    u: auth.UserRecord = await asyncio.to_thread(auth.get_user_by_email, token['email'])
    try:
        user = await get_user(u.uid, session)
        return user
    except HTTPException as e:
        if e.status_code == status.HTTP_404_NOT_FOUND:
            if not u.display_name:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Full name is null!')
            user = User(firebase_uid=u.uid, full_name=u.display_name, email=u.email)
            session.add(user)
            await session.commit()
            await session.refresh(user)
            return user

def has_admin_role(user: User) -> bool:
    return any(role.name == settings.ROLE_NAMES.ADMIN for role in user.roles)
