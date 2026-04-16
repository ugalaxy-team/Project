from fastapi import APIRouter, status, HTTPException, Depends
from fastapi.encoders import jsonable_encoder
from typing import Annotated
from app.dependencies import SessionDep, CurrentUserDep, get_current_user
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models import RoleRequest, User, Role, RoleRequestInfo
from app.schemas import RoleRequestPublic, RoleRequestCreate, UserPublic, NotificationCreate
from app.config import settings
from app.util import send_notification

router = APIRouter(prefix='/role-requests', tags=['role requests'])

async def get_role_request(request_id: int, session: SessionDep) -> RoleRequest:
    statement = (
        select(RoleRequest)
        .options(
            selectinload(RoleRequest.info).selectinload(RoleRequestInfo.option),
            selectinload(RoleRequest.role),
            selectinload(RoleRequest.user),
        )
        .where(RoleRequest.id==request_id)
    )
    result = await session.execute(statement)
    request = result.scalar()
    if not request:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail='Role request not found!')

    return request

async def get_admin_user(current_user: CurrentUserDep, session: SessionDep) -> User:
    statement = select(User).where(User.id==current_user.id).filter(User.roles.contains(Role.name == 'admin'))
    user = (await session.execute(statement)).scalar()
    if not user:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail='Permission denied!')
    return user
    

RoleRequestDep = Annotated[RoleRequest, Depends(get_role_request)]

AdminUserDep = Annotated[User, Depends(get_admin_user)]

@router.get('/', response_model=list[RoleRequestPublic])
async def role_requests(session: SessionDep):
    statement = select(RoleRequest).options(
        selectinload(RoleRequest.info).selectinload(RoleRequestInfo.option),
        selectinload(RoleRequest.role),
        selectinload(RoleRequest.user),
    )
    requests = await session.execute(statement)
    return requests.scalars().all()

@router.post('/', 
             response_model=RoleRequestPublic,
             dependencies=[Depends(get_current_user)])
async def create_request(
    session: SessionDep, 
    request_create: RoleRequestCreate
):
    request = RoleRequestCreate.model_validate(request_create)
    statement = select(RoleRequest).where(RoleRequest.role_name==request.role_name, 
                                          RoleRequest.user_id==request.user_id)
    r = (await session.execute(statement)).scalar()
    if r:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail='Role requests already exists!')
    request_data = request.model_dump()
    info = request_data.pop('info')
    role_request = RoleRequest(**request_data)
    session.add(role_request)
    await session.flush()
    for j in info:
        i = RoleRequestInfo(**j, request_id=role_request.id)
        session.add(i)
    await session.commit()
    return await get_role_request(role_request.id, session)

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
    notification = NotificationCreate(body=settings.ROLE_REQUEST_APPROVED_MESSAGE, user_id=request.user.id)
    await send_notification(notification, session, role=request.role.name)
    return request.user

@router.post('/{request_id}/reject/', response_model=UserPublic)
async def reject_request(request_id: int, request: RoleRequestDep, session: SessionDep):
    await session.delete(request)
    await session.commit()
    notification = NotificationCreate(body=settings.ROLE_REQUEST_REJECTED_MESSAGE, user_id=request.user.id)
    await send_notification(notification, session, role=request.role.name)
    return request.user

@router.delete('/{request_id}/', 
                status_code=status.HTTP_204_NO_CONTENT,
                dependencies=[Depends(get_current_user)])
async def delete_request(request_id: int, request: RoleRequestDep, session: SessionDep, current_user: CurrentUserDep):
    await session.delete(request)
    await session.commit()
