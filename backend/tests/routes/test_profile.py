import pytest
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.main import app
from app.dependencies import get_current_user
from app.models import User
from tests.factories import UserFactory

async def test_update_profile(create, client, db_session):
    user = await create(UserFactory)
    stmt = select(User).where(User.id == user.id).options(selectinload(User.roles))
    user = (await db_session.execute(stmt)).unique().scalar_one()
    full_name = 'John Doe'
    app.dependency_overrides[get_current_user] = lambda: user
    assert user.full_name != full_name
    resp = await client.patch('/profile/', json={
        'full_name': full_name
    })
    assert resp.json()['full_name'] == full_name
    app.dependency_overrides.pop(get_current_user)

async def test_delete_profile(create, client, db_session, mocker):
    user = await create(UserFactory)
    stmt = select(User).where(User.id == user.id).options(selectinload(User.roles))
    user = (await db_session.execute(stmt)).unique().scalar_one()
    assert await db_session.get(User, user.id) is not None
    mocker.patch("app.routes.profile.auth.get_user", return_value=False)
    app.dependency_overrides[get_current_user] = lambda: user
    resp = await client.delete('/profile/')
    assert resp.status_code == 204
    assert await db_session.get(User, user.id) is None
    app.dependency_overrides.pop(get_current_user)