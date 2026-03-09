from fastapi import APIRouter, status, HTTPException, Depends
from typing import Annotated
from app.dependencies import SessionDep, CurrentUserDep
from sqlalchemy import select
from app.models import RoleRequest, User, Role
from app.schemas import RoleRequestPublic, RoleRequestCreate, UserPublic

router = APIRouter(prefix='/role-requests', tags=['role requests'])

async def get_role_request(request_id: int, session: SessionDep) -> RoleRequest:
    statement = select(RoleRequest).where(RoleRequest.id==request_id)
    request = await session.execute(statement)
    if not request.first():
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail='Role request not found!')
    return request

async def get_admin_user(current_user: CurrentUserDep, session: SessionDep) -> User:
    statement = select(User).where(User.id==current_user.id).filter(User.roles.contains(Role.name == 'admin'))
    user = await session.execute(statement)
    if not user:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail='Permission denied!')
    return user
    

RoleRequestDep = Annotated[RoleRequest, Depends(get_role_request)]

AdminUserDep = Annotated[User, Depends(get_admin_user)]

@router.post('/', 
             response_model=RoleRequestPublic,
             dependencies=[CurrentUserDep])
async def create_request(
    session: SessionDep, 
    request: RoleRequestCreate
):
    request = RoleRequestCreate.model_validate(request)
    session.add(request)
    await session.commit()
    return request

# TODO: implement role request dis/approval permission handling
@router.post('/{request_id}/approve/', response_model=UserPublic)
async def approve_request(request_id: int, request: RoleRequestDep, session: SessionDep):
    request.user.roles.add(request.role)
    await session.refresh(request.user)
    await session.delete(request)
    await session.commit()
    return request.user

@router.post('/{request_id}/disapprove/', response_model=UserPublic)
async def approve_request(request_id: int, request: RoleRequestDep, session: SessionDep):
    await session.delete(request)
    await session.commit()
    return request.user

@router.delete('/{request_id}/', 
                status_code=status.HTTP_204_NO_CONTENT,
                dependencies=[CurrentUserDep])
async def delete_request(request_id: int, request: RoleRequestDep, session: SessionDep, current_user: CurrentUserDep):
    await session.delete(request)
    await session.commit()