from fastapi import APIRouter, status, HTTPException
from sqlalchemy import select

from app.dependencies import (
    AdminUserDep,
    CurrentUserDep,
    RoleRequestDep,
    SessionDep,
    get_role_request,
    get_current_user,
)
from app.models import RoleRequest, RoleRequestInfo
from app.schemas import (
    RoleRequestPublic,
    RoleRequestCreate,
    UserPublic,
    NotificationCreate,
)
from app.config import settings
from app.util import send_notification
from app.utils.routes import approve_role_request, reject_role_request

router = APIRouter(prefix="/role-requests", tags=["role-requests"])


@router.get("/", response_model=list[RoleRequestPublic])
async def role_requests(
    session: SessionDep,
    current_user: CurrentUserDep,
):
    is_admin = any(role.name == "admin" for role in current_user.roles)
    statement = select(RoleRequest)

    if not is_admin:
        statement = statement.where(RoleRequest.user_id == current_user.id)

    result = await session.execute(statement)
    return result.scalars().all()


@router.post("/", response_model=RoleRequestPublic, status_code=status.HTTP_201_CREATED)
async def create_request(
    session: SessionDep, request: RoleRequestCreate, user: CurrentUserDep
):

    statement = select(RoleRequest).where(
        RoleRequest.role_name == request.role_name,
        RoleRequest.user_id == user.id,
    )
    existing_request = (await session.execute(statement)).scalar()

    if existing_request:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, detail="Role requests already exists!"
        )

    request_data = request.model_dump()
    info = request_data.pop("info")
    role_request = RoleRequest(**request_data, user_id=user.id)
    session.add(role_request)
    await session.flush()

    for j in info:
        i = RoleRequestInfo(**j, request_id=role_request.id)
        session.add(i)

    await session.commit()
    return await get_role_request(role_request.id, session)


@router.get("/{request_id}/", response_model=RoleRequestPublic)
async def get_request(request_id: int, session: SessionDep, request: RoleRequestDep):
    return request


@router.post("/{request_id}/approve/", response_model=UserPublic)
async def approve_request(
    request: RoleRequestDep, session: SessionDep, admin: AdminUserDep
):
    await approve_role_request(request, session)
    await session.commit()

    message = settings.ROLE_REQUEST_APPROVED_MESSAGE.replace("$role", request.role_name)

    notification_data = NotificationCreate(
        user_id=request.user_id, message=message.strip()
    )
    await send_notification(notification_data, session)

    return request.user


@router.post("/{request_id}/reject/", response_model=UserPublic)
async def reject_request(
    request: RoleRequestDep, session: SessionDep, admin: AdminUserDep
):

    await reject_role_request(request, session)
    await session.commit()

    message = settings.ROLE_REQUEST_REJECTED_MESSAGE.replace("$role", request.role_name)
    notification_data = NotificationCreate(
        user_id=request.user_id, message=message.strip()
    )

    await send_notification(notification_data, session)

    return request.user


@router.delete("/{request_id}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_request(
    request: RoleRequestDep,
    session: SessionDep,
    current_user: CurrentUserDep,
):
    if request.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own requests",
        )

    await session.delete(request)
    await session.commit()
