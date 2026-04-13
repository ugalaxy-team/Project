from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from app.models import User
from .session import SessionDep
from firebase_admin import auth
from firebase_admin.auth import (
    InvalidIdTokenError,
    ExpiredIdTokenError,
    RevokedIdTokenError,
    CertificateFetchError,
    UserDisabledError,
)
from app.firebase import firebase
from app.routes.users import get_user

async def get_current_user(
    session: SessionDep,
    token: Annotated[HTTPBearer | str, Depends(HTTPBearer())]
) -> User:
    try:
        # If using http
        if hasattr(token, 'credentials'):
            token = auth.verify_id_token(token.credentials, firebase)
        # If using websockets
        else: 
            token = auth.verify_id_token(token, firebase)
        u: auth.UserRecord = auth.get_user_by_email(token['email'])
        try:
            user = await get_user(u.uid, session)
        except HTTPException as e:
            if e.status_code == status.HTTP_404_NOT_FOUND:
                if not u.display_name:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Full name is null!')
                user = User(firebase_uid=u.uid, full_name=u.display_name, email=u.email)
                session.add(user)
                await session.commit()
                await session.refresh(user)
    except (
        ValueError,
        InvalidIdTokenError,
        ExpiredIdTokenError,
        RevokedIdTokenError,
        CertificateFetchError,
        UserDisabledError,
    ) as e:
        print(e)
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail='Invalid id token!')
    return user
    

CurrentUserDep = Annotated[User, Depends(get_current_user)]
