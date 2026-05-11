import pytest
from app.utils import send_notification
from app.schemas import NotificationCreate
from .factories import UserFactory, RoleFactory
from app.config import settings
from app import app
from app.websockets import sio


@pytest.mark.asyncio
async def test_send_role_request_notification(db_session, create, mocker):
    user = await create(UserFactory)
    role = await create(RoleFactory)
    notification = NotificationCreate(
        body=settings.ROLE_REQUEST_NOTIFICATION_MESSAGE, user_id=user.id
    )
    app.state.user_websocket_sessions[user.id] = {"sid": "test"}
    spy = mocker.spy(sio, "emit")
    await send_notification(notification, db_session, user=user.full_name, role=role.name)
    assert spy.call_count == 1
