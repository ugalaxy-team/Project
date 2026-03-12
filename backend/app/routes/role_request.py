from fastapi import APIRouter, status, HTTPException, Depends
from fastapi.encoders import jsonable_encoder
from typing import Annotated
from app.dependencies import SessionDep, CurrentUserDep, get_current_user
from sqlalchemy import select
from app.models import RoleRequest, User, Role
from app.schemas import RoleRequestPublic, RoleRequestCreate, UserPublic

router = APIRouter(prefix='/role-requests', tags=['role requests'])

async def get_role_request(request_id: int, session: SessionDep) -> RoleRequest:
    statement = select(RoleRequest).where(RoleRequest.id==request_id)
    result = await session.execute(statement)
    request = result.scalar_one_or_none()
    if not request:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail='Role request not found!')

    return request

async def get_admin_user(current_user: CurrentUserDep, session: SessionDep) -> User:
    statement = select(User).where(User.id==current_user.id).filter(User.roles.contains(Role.name == 'admin'))
    user = (await session.execute(statement)).scalar_one_or_none()
    if not user:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail='Permission denied!')
    return user
    

RoleRequestDep = Annotated[RoleRequest, Depends(get_role_request)]

AdminUserDep = Annotated[User, Depends(get_admin_user)]

@router.post('/', 
             response_model=RoleRequestPublic,
             dependencies=[Depends(get_current_user)])
async def create_request(
    session: SessionDep, 
    request: RoleRequestCreate
):
    request = RoleRequestCreate.model_validate(request)
    statement = select(RoleRequest).where(RoleRequest.role_id==request.role_id, 
                                          RoleRequest.user_id==request.user_id)
    r = (await session.execute(statement)).scalar()
    if r:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail='Role requests already exists!')
    request = RoleRequest(**request.model_dump())
    session.add(request)
    await session.commit()
    await session.refresh(request)
    return request

@router.get('/{request_id}/', response_model=RoleRequestPublic)
async def get_request(request_id: int, session: SessionDep, request: RoleRequestDep):
    return request

# TODO: implement role request dis/approval permission handling
@router.post('/{request_id}/approve/', response_model=UserPublic)
async def approve_request(request_id: int, request: RoleRequestDep, session: SessionDep):
    request.user.roles.append(request.role)
    await session.delete(request)
    await session.commit()
    await session.refresh(request.user)
    return request.user

@router.post('/{request_id}/disapprove/', response_model=UserPublic)
async def disapprove_request(request_id: int, request: RoleRequestDep, session: SessionDep):
    await session.delete(request)
    await session.commit()
    return request.user

@router.delete('/{request_id}/', 
                status_code=status.HTTP_204_NO_CONTENT,
                dependencies=[Depends(get_current_user)])
async def delete_request(request_id: int, request: RoleRequestDep, session: SessionDep, current_user: CurrentUserDep):
    await session.delete(request)
    await session.commit()