import pytest
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app import app
from app.dependencies import get_current_user
from app.dependencies.admin_user import get_admin_user
from app.models import RoleRequest, User
from tests.factories import UserFactory, RoleFactory
from app.websockets import sio

@pytest.mark.asyncio
async def test_role_request_and_approval(create, client, db_session, mocker):
    user = await create(UserFactory)
    stmt = select(User).where(User.id == user.id).options(selectinload(User.roles))
    user = (await db_session.execute(stmt)).unique().scalar_one()
    role = await create(RoleFactory)
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[get_admin_user] = lambda: user
    assert len(user.roles) == 0
    resp = await client.post('/role-requests/', json={
        'role_name': role.name,
        'user_id': user.id,
    })
    assert resp.status_code == 201
    assert resp.json()['role_name'] == role.name
    assert resp.json()['user_id'] == user.id
    req_id = resp.json()['id']
    s = select(RoleRequest)
    assert len((await db_session.execute(s)).scalars().all()) == 1
    app.state.user_websocket_sessions[user.id] = {
        'sid': 'test'
    }
    spy = mocker.spy(sio, 'emit')
    resp = await client.post(f'/role-requests/{req_id}/approve/')
    assert resp.status_code == 200
    assert len(resp.json()['roles']) == 1
    assert len((await db_session.execute(s)).scalars().all()) == 0
    assert spy.call_count == 1
    app.dependency_overrides.pop(get_current_user)
    app.dependency_overrides.pop(get_admin_user)

@pytest.mark.asyncio
async def test_create_role_request_exists(create, client, db_session):
    user = await create(UserFactory)
    stmt = select(User).where(User.id == user.id).options(selectinload(User.roles))
    user = (await db_session.execute(stmt)).unique().scalar_one()
    role = await create(RoleFactory)
    app.dependency_overrides[get_current_user] = lambda: user
    r = RoleRequest(role_name=role.name, user_id=user.id)
    db_session.add(r)
    await db_session.commit()
    resp = await client.post('/role-requests/', json={
        'role_name': role.name,
        'user_id': user.id,
    })
    assert resp.status_code == 400
    assert 'exists' in resp.json()['detail']
    assert len(user.roles) == 0
    s = select(RoleRequest)
    assert len((await db_session.execute(s)).scalars().all()) == 1
    app.dependency_overrides.pop(get_current_user)

@pytest.mark.asyncio
async def test_role_request_disapproval(create, client, db_session, mocker):
    user = await create(UserFactory)
    stmt = select(User).where(User.id == user.id).options(selectinload(User.roles))
    user = (await db_session.execute(stmt)).unique().scalar_one()
    role = await create(RoleFactory)
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[get_admin_user] = lambda: user
    r = RoleRequest(role_name=role.name, user_id=user.id)
    db_session.add(r)
    await db_session.commit()
    await db_session.refresh(r)
    app.state.user_websocket_sessions[user.id] = {
        'sid': 'test'
    }
    spy = mocker.spy(sio, 'emit')
    resp = await client.post(f'/role-requests/{r.id}/reject/')
    assert resp.status_code == 200
    assert len(user.roles) == 0
    assert spy.call_count == 1
    s = select(RoleRequest)
    assert len((await db_session.execute(s)).scalars().all()) == 0
    app.dependency_overrides.pop(get_current_user)
    app.dependency_overrides.pop(get_admin_user)

@pytest.mark.asyncio
async def test_get_role_request(create, client, db_session):
    user = await create(UserFactory)
    stmt = select(User).where(User.id == user.id).options(selectinload(User.roles))
    user = (await db_session.execute(stmt)).unique().scalar_one()
    role = await create(RoleFactory)
    app.dependency_overrides[get_current_user] = lambda: user
    r = RoleRequest(role_name=role.name, user_id=user.id)
    db_session.add(r)
    await db_session.commit()
    await db_session.refresh(r)
    resp = await client.get(f'/role-requests/{r.id}/')
    assert resp.status_code == 200
    assert resp.json()['role_name'] == r.role_name
    assert resp.json()['user_id'] == r.user_id
    app.dependency_overrides.pop(get_current_user)

@pytest.mark.asyncio
async def test_delete_role_request(create, client, db_session):
    user = await create(UserFactory)
    stmt = select(User).where(User.id == user.id).options(selectinload(User.roles))
    user = (await db_session.execute(stmt)).unique().scalar_one()
    role = await create(RoleFactory)
    app.dependency_overrides[get_current_user] = lambda: user
    r = RoleRequest(role_name=role.name, user_id=user.id)
    db_session.add(r)
    await db_session.commit()
    await db_session.refresh(r)
    resp = await client.delete(f'/role-requests/{r.id}/')
    assert resp.status_code == 204
    assert not (await db_session.execute(select(RoleRequest))).scalar()
    app.dependency_overrides.pop(get_current_user)