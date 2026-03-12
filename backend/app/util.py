from app.dependencies import SessionDep
from app.schemas import NotificationCreate
from app.models import Notification
from string import Template

async def send_notification(notification: NotificationCreate, session: SessionDep, **kwargs) -> Notification:
    notification = NotificationCreate.model_validate(notification)
    try:
        notification.body = str(Template(notification.body).substitute(**kwargs))
    except ValueError:
        raise ValueError('Notification body placeholder was not provided!')
    notification = Notification(**notification.model_dump())
    session.add(notification)
    await session.commit()
    return notification