from app.models import RoleRequest
from app.schemas import NotificationCreate
from app.config import settings
from app.dependencies import SessionDep
from ..notifications import send_notification


async def approve_role_request(request: RoleRequest, session: SessionDep) -> None:
    request.user.roles.append(request.role)
    await session.delete(request)
    await session.commit()
    await session.refresh(request.user)
    
async def approve_role_request_with_notification(request: RoleRequest, session: SessionDep):
    await approve_role_request(request, session)
    notification = NotificationCreate(
        body=settings.ROLE_REQUEST_APPROVED_MESSAGE, user_id=request.user.id
    )
    await send_notification(notification, session, role=request.role.name)


async def reject_role_request(request: RoleRequest, session: SessionDep) -> None:
    await session.delete(request)
    await session.commit()
    
async def reject_role_request_with_notification(request: RoleRequest, session: SessionDep):
    await reject_role_request(request, session)
    notification = NotificationCreate(
        body=settings.ROLE_REQUEST_REJECTED_MESSAGE, user_id=request.user.id
    )
    await send_notification(notification, session, role=request.role.name)