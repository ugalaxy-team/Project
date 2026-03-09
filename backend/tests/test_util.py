import pytest
from app.util import send_notification
from app.schemas import NotificationCreate
from app.config import settings

@pytest.mark.asyncio
async def test_send_role_request_notification(db_session, user, role):

    notification = NotificationCreate(body=settings.ROLE_REQUEST_NOTIFICATION_MESSAGE, user=user.full_name, role=role.name)
    await send_notification(notification, db_session)