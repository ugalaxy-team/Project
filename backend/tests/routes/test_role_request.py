import pytest
from app.main import app
from app.dependencies import get_current_user
from backend.app.routes.role_requests import get_admin_user
from app.models import RoleRequest
from sqlalchemy import select

@pytest.mark.asyncio
async def test_role_request_and_approval(user, role, client, db_session):
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[get_admin_user] = lambda: user
    assert len(user.roles) == 0
    resp = client.post('/role-requests/', json={
        'role_id': role.id,
        'user_id': user.id,
    })
    assert resp.status_code == 200
    assert resp.json()['role_id'] == role.id
    assert resp.json()['user_id'] == user.id
    req_id = resp.json()['id']
    s = select(RoleRequest)
    assert len((await db_session.execute(s)).scalars().all()) == 1
    resp = client.post(f'/role-requests/{req_id}/approve/')
    assert resp.status_code == 200
    assert len(resp.json()['roles']) == 1
    assert len((await db_session.execute(s)).scalars().all()) == 0
    app.dependency_overrides.pop(get_current_user)
    app.dependency_overrides.pop(get_admin_user)

@pytest.mark.asyncio
async def test_create_role_request_exists(user, role, client, db_session):
    app.dependency_overrides[get_current_user] = lambda: user
    r = RoleRequest(role_id=role.id, user_id=user.id)
    db_session.add(r)
    await db_session.commit()
    resp = client.post('/role-requests/', json={
        'role_id': role.id,
        'user_id': user.id,
    })
    assert resp.status_code == 400
    assert 'exists' in resp.json()['detail']
    assert len(user.roles) == 0
    s = select(RoleRequest)
    assert len((await db_session.execute(s)).scalars().all()) == 1
    app.dependency_overrides.pop(get_current_user)

@pytest.mark.asyncio
async def test_role_request_disapproval(user, role, client, db_session):
    app.dependency_overrides[get_current_user] = lambda: user
    r = RoleRequest(role_id=role.id, user_id=user.id)
    db_session.add(r)
    await db_session.commit()
    await db_session.refresh(r)
    resp = client.post(f'/role-requests/{r.id}/disapprove/')
    assert resp.status_code == 200
    assert len(user.roles) == 0
    s = select(RoleRequest)
    assert len((await db_session.execute(s)).scalars().all()) == 0
    app.dependency_overrides.pop(get_current_user)

@pytest.mark.asyncio
async def test_get_role_request(user, role, client, db_session):
    app.dependency_overrides[get_current_user] = lambda: user
    r = RoleRequest(role_id=role.id, user_id=user.id)
    db_session.add(r)
    await db_session.commit()
    await db_session.refresh(r)
    resp = client.get(f'/role-requests/{r.id}/')
    assert resp.status_code == 200
    assert resp.json()['role_id'] == r.role_id
    assert resp.json()['user_id'] == r.user_id
    app.dependency_overrides.pop(get_current_user)

@pytest.mark.asyncio
async def test_delete_role_request(user, role, client, db_session):
    app.dependency_overrides[get_current_user] = lambda: user
    r = RoleRequest(role_id=role.id, user_id=user.id)
    db_session.add(r)
    await db_session.commit()
    await db_session.refresh(r)
    resp = client.delete(f'/role-requests/{r.id}/')
    assert resp.status_code == 204
    assert not (await db_session.execute(select(RoleRequest))).scalar()
    app.dependency_overrides.pop(get_current_user)