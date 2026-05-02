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
from app.utils import get_or_create_user_from_token

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
        user = await get_or_create_user_from_token(token, session)
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
