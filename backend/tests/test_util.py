import pytest
from app.util import send_notification
from app.schemas import NotificationCreate
from .factories import UserFactory, RoleFactory
from app.config import settings

@pytest.mark.asyncio
async def test_send_role_request_notification(db_session, create):
    user = await create(UserFactory)
    role = await create(RoleFactory)
    notification = NotificationCreate(body=settings.ROLE_REQUEST_NOTIFICATION_MESSAGE, user_id=user.id)
    await send_notification(notification, db_session, user=user.full_name, role=role.name)