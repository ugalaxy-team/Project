import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
from app.models import User, Role


async def test_create_user(user):

    assert user.id is not None
    assert user.full_name == "Test User"
    assert user.email == "test@example.com"
    assert user.created_at is not None


async def test_create_user_duplicate_email(db_session, user):
    user2 = User(
        full_name="Petro Petrov",
        email=user.email,
        password="very_strong_password",
    )
    db_session.add(user2)

    with pytest.raises(IntegrityError):
        await db_session.flush()

    await db_session.rollback()


async def test_create_user_without_password(db_session):

    user = User(
        full_name="No Password",
        email="nopass@example.com",
    )
    db_session.add(user)

    with pytest.raises(IntegrityError):
        await db_session.commit()

    await db_session.rollback()


async def test_create_role(role):

    assert role.id is not None
    assert role.name == "jury"


async def test_role_name_unique_constraint(db_session, role):

    role_duplicate = Role(name="jury")
    db_session.add(role_duplicate)

    with pytest.raises(IntegrityError):
        await db_session.commit()

    await db_session.rollback()


async def test_user_roles_relationship(db_session, user, role):
    admin_role = Role(name="admin")
    db_session.add(admin_role)

    await db_session.refresh(user, attribute_names=["roles"])
    user.roles.extend([role, admin_role])

    await db_session.flush()

    stmt = select(User).where(User.id == user.id).options(selectinload(User.roles))
    result = await db_session.execute(stmt)

    db_user = result.unique().scalar_one()

    assert len(db_user.roles) == 2

    role_names = [r.name for r in db_user.roles]
    assert "admin" in role_names
    assert "jury" in role_names


async def test_create_team_member(db_session, team, team_member):

    assert team_member.id is not None
    assert team_member.team_id == team.id
