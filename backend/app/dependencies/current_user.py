from typing import Annotated
from fastapi import Depends, HTTPException, status
from sqlalchemy import select, or_
from fastapi.security import HTTPBearer
from firebase_admin import auth
from firebase_admin.auth import (
    InvalidIdTokenError,
    ExpiredIdTokenError,
    RevokedIdTokenError,
    CertificateFetchError,
    UserDisabledError,
)

from app.models import User
from .session import SessionDep
from app.firebase import firebase
from app.utils import get_or_create_user_from_token

async def get_current_user(
    session: SessionDep, token: Annotated[HTTPBearer | str, Depends(HTTPBearer())]
) -> User:
    try:
        # If using http
        if hasattr(token, "credentials"):
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
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid id token!")
    return user


# We don't use the functions defined above, because if i.e. user by email is not found and
# the function is called first, the error will be thrown.
# TODO?: Possible refactoring required because of this
async def get_user(identifier: str | int, session: SessionDep):
    if isinstance(identifier, str):
        statement = select(User).where(
            or_(User.firebase_uid == identifier, User.email == identifier)
        )
    elif isinstance(identifier, int):
        statement = select(User).where(User.id == identifier)
    else:
        raise ValueError("Wrong user identifier type")
    user = (await session.execute(statement)).scalar()

    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found!")
    return user


UserDep = Annotated[User, Depends(get_user)]
CurrentUserDep = Annotated[User, Depends(get_current_user)]

# It may be possible to rename the file in the future
