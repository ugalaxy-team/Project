import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
from app.models import User, Role


async def test_create_user(db_session):
    user = User(
        full_name="Ivan Ivanov",
        email="ivan@example.com",
        password="very_strong_password",
    )
    db_session.add(user)
    await db_session.commit()

    assert user.id is not None
    assert user.full_name == "Ivan Ivanov"
    assert user.email == "ivan@example.com"
    assert user.created_at is not None


async def test_create_user_duplicate_email(db_session):

    user1 = User(
        full_name="Ivan Ivanov",
        email="unique@example.com",
        password="very_strong_password",
    )
    db_session.add(user1)
    await db_session.commit()

    user2 = User(
        full_name="Petro Petrov",
        email="unique@example.com",
        password="very_strong_password",
    )
    db_session.add(user2)

    with pytest.raises(IntegrityError):
        await db_session.commit()

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


async def test_create_role(db_session):
    role = Role(name="organizer")
    db_session.add(role)
    await db_session.commit()
    await db_session.refresh(role)

    assert role.id is not None
    assert role.name == "organizer"


async def test_role_name_unique_constraint(db_session):

    role1 = Role(name="jury")
    db_session.add(role1)
    await db_session.commit()

    role2 = Role(name="jury")
    db_session.add(role2)

    with pytest.raises(IntegrityError):
        await db_session.commit()

    await db_session.rollback()


async def test_user_roles_relationship(db_session):
    admin_role = Role(name="admin")
    user_role = Role(name="user")
    db_session.add_all([admin_role, user_role])
    await db_session.commit()

    user = User(
        full_name="Power User",
        email="admin@example.com",
        password="secret_password",
        roles=[admin_role, user_role],
    )
    db_session.add(user)
    await db_session.commit()
    stmt = select(User).where(User.id == user.id).options(selectinload(User.roles))
    result = await db_session.execute(stmt)
    user = result.scalar_one()

    assert len(user.roles) == 2
    assert any(role.name == "admin" for role in user.roles)
    assert any(role.name == "user" for role in user.roles)
