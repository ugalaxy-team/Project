from string import Template
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.dependencies import SessionDep
from app.models import Notification, User
from app.schemas import NotificationCreate, NotificationPublic
import asyncio
from firebase_admin import auth
from fastapi import HTTPException, status
from app.routes.users import get_user
from app.config import settings


async def send_notification(notification: NotificationCreate, session: SessionDep, **kwargs) -> Notification:
    from app import app
    from app.websockets import sio

    notification = NotificationCreate.model_validate(notification)
    try:
        notification.body = str(Template(notification.body).substitute(**kwargs))
    except ValueError:
        raise ValueError('Notification body placeholder was not provided!')

    notification = Notification(**notification.model_dump())
    session.add(notification)
    await session.commit()
    await session.refresh(notification)
    notification_dict = {
        'body': notification.body,
        'user_id': notification.user_id,
        'is_global': notification.is_global,
    }
    if notification.user_id:
        user = await get_user(notification.user_id, session)
        notification_dict['user'] = user
    payload = NotificationPublic.model_validate(notification_dict)

    try:
        user_sid = app.state.user_websocket_sessions[notification.user_id]['sid']
        await sio.emit('notification', payload.model_dump(), user_sid)
    except KeyError:
        # If the user is offline, don't send the event.
        pass

    return notification

async def get_or_create_user_from_token(token: dict, session: SessionDep) -> User:
    u: auth.UserRecord = await asyncio.to_thread(auth.get_user_by_email, token['email'])
    try:
        user = await get_user(u.uid, session)
        return user
    except HTTPException as e:
        if e.status_code == status.HTTP_404_NOT_FOUND:
            if not u.display_name:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Full name is null!')
            user = User(firebase_uid=u.uid, full_name=u.display_name, email=u.email)
            session.add(user)
            await session.commit()
            await session.refresh(user)
            return user

def has_admin_role(user: User) -> bool:
    return any(role.name == settings.ROLE_NAMES.ADMIN for role in user.roles)
