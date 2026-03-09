from app.dependencies import SessionDep
from app.schemas import NotificationCreate, NotificationPublic
from string import Template

async def send_notification(notification: NotificationCreate, session: SessionDep, **kwargs) -> NotificationPublic:
    notification = NotificationCreate.model_validate(notification)
    try:
        notification.body = Template(notification.body).substitute(**kwargs)
    except ValueError:
        raise ValueError('Notification body placeholder was not provided!')
    session.add(notification)
    await session.commit()
    return NotificationPublic.model_validate(notification)