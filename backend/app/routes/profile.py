from fastapi import APIRouter, status
from app.schemas import UserUpdate, UserPublic
from app.dependencies import SessionDep, CurrentUserDep

router = APIRouter(prefix='/profile', tags=['profile'])

@router.patch('/', response_model=UserPublic)
async def edit_profile(session: SessionDep, current_user: CurrentUserDep,
                user: UserUpdate):
    user_data = user.model_dump(exclude_unset=True)
    current_user.full_name = user_data['full_name']
    await session.commit()
    return current_user

@router.delete('/', status_code=status.HTTP_204_NO_CONTENT)
async def delete_profile(session: SessionDep, current_user: CurrentUserDep):
    await session.delete(current_user)
    await session.commit()