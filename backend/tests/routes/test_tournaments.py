import pytest
from app import app
from app.dependencies import get_current_user
from tests.factories import (
    TournamentFactory,
    UserFactory,
    TournamentStatusOptionFactory,
    RoleFactory,
)
from app.config import settings


async def test_create_tournament(create, client, db_session):
    adm = await create(RoleFactory, name=settings.ROLE_NAMES.ADMIN)
    user = await create(UserFactory, roles=[adm])
    u1 = await create(UserFactory)
    u2 = await create(UserFactory)
    await create(TournamentStatusOptionFactory, name=settings.TOURNAMENT_STATUS_NAMES.DRAFT)
    t = TournamentFactory.build()
    app.dependency_overrides[get_current_user] = lambda: user
    resp = await client.post(
        f"/tournaments/",
        json={
            "title": t.title,
            "description": t.description,
            "start_date": str(t.start_date),
            "reg_start": str(t.reg_start),
            "reg_end": str(t.reg_end),
            "min_people_in_team": t.min_people_in_team,
            "max_people_in_team": t.max_people_in_team,
            "max_teams": t.max_teams,
            "juries": [u1.id, u2.id],
        },
    )
    assert resp.status_code == 201
    juries_ids = [jury["id"] for jury in resp.json()["juries"]]
    assert u1.id in juries_ids
    assert u2.id in juries_ids
    assert len(resp.json()["juries"]) == 2
    app.dependency_overrides.pop(get_current_user)


async def test_update_tournament_juries(create, client):
    user = await create(UserFactory)
    u1 = await create(UserFactory)
    u2 = await create(UserFactory)
    t = await create(TournamentFactory, creator=user)
    app.dependency_overrides[get_current_user] = lambda: user
    resp = await client.patch(
        f"/tournaments/{t.id}/",
        json={
            "juries": [u1.id, u2.id],
        },
    )
    assert resp.status_code == 200
    juries_ids = [jury["id"] for jury in resp.json()["juries"]]
    assert u1.id in juries_ids
    assert u2.id in juries_ids
    assert len(resp.json()["juries"]) == 2
    app.dependency_overrides.pop(get_current_user)
