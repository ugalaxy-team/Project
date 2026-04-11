from fastapi import APIRouter, status
from app.schemas import UserUpdate, CurrentUser
from app.dependencies import SessionDep, CurrentUserDep
import firebase_admin.auth as auth
from app.firebase import firebase

router = APIRouter(prefix='/profile', tags=['profile'])

@router.get('/', response_model=CurrentUser)
async def get_profile(current_user: CurrentUserDep):
    return current_user

@router.patch('/', response_model=CurrentUser)
async def edit_profile(session: SessionDep, current_user: CurrentUserDep,
                user: UserUpdate):
    user_data = user.model_dump(exclude_unset=True)
    current_user.full_name = user_data['full_name']
    current_user.telegram = user_data['telegram']
    current_user.github = user_data['github']
    current_user.discord = user_data['discord']
    await session.commit()
    return current_user

@router.delete('/', status_code=status.HTTP_204_NO_CONTENT)
async def delete_profile(session: SessionDep, current_user: CurrentUserDep):
    await session.delete(current_user)
    if auth.get_user(current_user.firebase_uid):
        auth.delete_user(current_user.firebase_uid, firebase)
    await session.commit()