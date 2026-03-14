from fastapi import APIRouter, HTTPException, status
from app.schemas import UserIDToken, UserCreate
from app.dependencies import SessionDep
from app.models import User
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

router = APIRouter(prefix='/auth', tags=['auth'])

@router.post('/register/')
async def register(session: SessionDep, t: UserIDToken):
    try:
        token = auth.verify_id_token(t.id_token, firebase)
        u = auth.get_user_by_email(token['email'])
        try:
            await get_user(u.uid, session)
            await get_user(u.email, session)
        except HTTPException:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail='User exists!')
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
    
    