from app.dependencies import SessionDep
from app.schemas import NotificationCreate, NotificationPublic
from app.models import Notification
from string import Template
from .websockets import sio
from app import app

async def send_notification(notification: NotificationCreate, session: SessionDep, **kwargs) -> Notification:
    notification = NotificationCreate.model_validate(notification)
    try:
        notification.body = str(Template(notification.body).substitute(**kwargs))
    except ValueError:
        raise ValueError('Notification body placeholder was not provided!')
    notification = Notification(**notification.model_dump())
    user_sid = app.state.user_websocket_sessions[notification.user_id]['sid']
    sio.emit('on_notification', NotificationPublic.model_validate(notification).model_dump(), user_sid)
    session.add(notification)
    await session.commit()
    return notification