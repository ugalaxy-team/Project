from app.dependencies import SessionDep
from app.schemas import NotificationCreate, NotificationPublic
from app.models import Notification, User
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from string import Template

async def send_notification(notification: NotificationCreate, session: SessionDep, **kwargs) -> Notification:
    from .websockets import sio
    from app import app
    notification = NotificationCreate.model_validate(notification)
    try:
        notification.body = str(Template(notification.body).substitute(**kwargs))
    except ValueError:
        raise ValueError('Notification body placeholder was not provided!')
    notification = Notification(**notification.model_dump())
    session.add(notification)
    await session.commit()
    await session.refresh(notification)
    user_result = await session.execute(
        select(User).options(selectinload(User.roles)).where(User.id == notification.user_id)
    )
    user = user_result.scalar_one()
    payload = NotificationPublic.model_validate({
        'body': notification.body,
        'user_id': notification.user_id,
        'user': user,
    })
    try:
        user_sid = app.state.user_websocket_sessions[notification.user_id]['sid']
        await sio.emit('notification', payload.model_dump(), user_sid)
    except KeyError:
        # If the user is offline, don't send the event
        pass
    return notification
