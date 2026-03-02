import pytest
from app.main import app
from app.dependencies import get_current_user
from app.models import User

async def test_update_profile(user, client):
    full_name = 'John Doe'
    app.dependency_overrides[get_current_user] = lambda: user
    assert user.full_name != full_name
    resp = client.patch('/profile/', json={
        'full_name': full_name
    })
    assert resp.json()['full_name'] == full_name
    app.dependency_overrides.pop(get_current_user)

async def test_delete_profile(user, client, db_session):
    assert await db_session.get(User, user.id) is not None
    app.dependency_overrides[get_current_user] = lambda: user
    resp = client.delete('/profile/')
    assert resp.status_code == 204
    assert await db_session.get(User, user.id) is None
    app.dependency_overrides.pop(get_current_user)