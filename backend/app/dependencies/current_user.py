import asyncio
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

from .session import SessionDep
from app.models import User
from app.firebase import firebase


async def get_or_create_user_from_token(token: dict, session: SessionDep) -> User:
    try:
        u: auth.UserRecord = await asyncio.to_thread(
            auth.get_user_by_email, token["email"]
        )
    except auth.UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Firebase user not found"
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service error",
        ) from e

    try:
        user = await get_user(u.uid, session)
        return user
    except HTTPException as e:
        if e.status_code == status.HTTP_404_NOT_FOUND:
            if not u.display_name:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail="Full name is null!"
                )
            user = User(firebase_uid=u.uid, full_name=u.display_name, email=u.email)
            session.add(user)
            await session.commit()
            await session.refresh(user)
            return user


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


async def get_user_by_id(identifier: str, session: SessionDep) -> User:
    try:
        ident = int(identifier)
    except ValueError:
        ident = identifier

    return await get_user(ident, session)


UserDep = Annotated[User, Depends(get_user_by_id)]
CurrentUserDep = Annotated[User, Depends(get_current_user)]

# It may be possible to rename the file in the future
