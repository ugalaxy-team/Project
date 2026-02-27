import pytest
from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
from app.models import (
    User,
    Role,
    TeamMember,
    Team,
    Task,
    TaskRequirementCategory,
    TaskRequirementOption,
)


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
        await db_session.flush()

    await db_session.rollback()


async def test_create_role(role):

    assert role.id is not None
    assert role.name == "jury"


async def test_role_name_unique_constraint(db_session, role):

    role_duplicate = Role(name="jury")
    db_session.add(role_duplicate)

    with pytest.raises(IntegrityError):
        await db_session.flush()

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


async def test_create_team_member(team, team_member):

    assert team_member.id is not None
    assert team_member.team_id == team.id


async def test_team_member_without_data(db_session):
    member = TeamMember()

    db_session.add(member)

    with pytest.raises(IntegrityError):
        await db_session.flush()

    await db_session.rollback()


async def test_team_member_duplicate_email(db_session, team, team_member):
    duplicate = TeamMember(
        full_name="Test Name",
        email=team_member.email,
        telegram_username="@test2",
        educational_institution="Test School",
        team_id=team.id,
    )

    db_session.add(duplicate)

    with pytest.raises(IntegrityError):
        await db_session.flush()

    await db_session.rollback()


async def test_create_team(team):

    assert team.id is not None
    assert team.name == "Test Team"
    assert team.team_email == "test@example.com"
    assert team.contact_info == "0680000000"


async def test_team_without_data(db_session):
    team = Team()

    db_session.add(team)

    with pytest.raises(IntegrityError):
        await db_session.flush()

    await db_session.rollback()


async def test_team_duplicate_email(db_session, team, tournament):
    duplicate_team = Team(
        name="Test Name",
        team_email=team.team_email,
        contact_info="0680000001",
        tournament_id=tournament.id,
    )

    db_session.add(duplicate_team)

    with pytest.raises(IntegrityError):
        await db_session.flush()

    await db_session.rollback()


async def test_set_team_captain(db_session, team, team_member):
    team.captain_id = team_member.id
    db_session.add(team)
    await db_session.commit()

    await db_session.refresh(team)
    assert team.captain_id == team_member.id


async def test_team_team_member_relationship(db_session, team, team_member):
    stmt = select(Team).where(Team.id == team.id).options(selectinload(Team.members))
    result = await db_session.execute(stmt)

    db_team = result.unique().scalar_one()

    assert len(db_team.members) == 1
    assert db_team.members[0].id == team_member.id


async def test_team_cascade_delete_members(db_session, team, team_member):
    member_id = team_member.id

    await db_session.delete(team)
    await db_session.commit()

    stmt = select(TeamMember).where(TeamMember.id == member_id)
    result = await db_session.execute(stmt)

    assert result.scalar_one_or_none() is None


async def test_create_task(task, tournament):

    assert task.id is not None
    assert task.title == "Test Title"
    assert task.tournament_id == tournament.id
    assert task.status_id == "draft"


async def test_task_requirements_relationship(db_session, task):

    category = TaskRequirementCategory(
        name="Test Category", display_name="Test Category", main_id="Test Category"
    )
    option = TaskRequirementOption(
        name="Test Option", display_name="Test Option", category=category
    )
    db_session.add_all([category, option])
    await db_session.flush()

    await db_session.refresh(task, attribute_names=["requirements"])

    task.requirements.append(option)
    await db_session.commit()

    stmt = (
        select(Task).where(Task.id == task.id).options(selectinload(Task.requirements))
    )

    result = await db_session.execute(stmt)
    db_task = result.unique().scalar_one()

    assert len(db_task.requirements) == 1
    assert db_task.requirements[0].name == "Test Option"


async def test_task_without_data(db_session):
    task = Task()

    db_session.add(task)

    with pytest.raises(IntegrityError):
        await db_session.flush()

    await db_session.rollback()


async def test_task_invalid_time(db_session, tournament):
    task = Task(
        title="Test Task",
        description="...",
        tournament_id=tournament.id,
        start_time=datetime.now(),
        end_time=datetime.now() - timedelta(hours=1),
        status_id="draft",
    )
    db_session.add(task)

    await db_session.commit()
    assert task.end_time < task.start_time


async def test_task_category_hierarchy(db_session):
    parent = TaskRequirementCategory(
        name="Programming", display_name="Programming Languages"
    )
    db_session.add(parent)
    await db_session.flush()

    child = TaskRequirementCategory(
        name="Python",
        display_name="Python Language",
        main_id="Programming",
        parent_category=parent,
    )
    db_session.add(child)
    await db_session.commit()

    stmt = (
        select(TaskRequirementCategory)
        .where(TaskRequirementCategory.name == "Programming")
        .options(selectinload(TaskRequirementCategory.sub_categories))
    )

    result = await db_session.execute(stmt)
    db_parent = result.unique().scalar_one()

    assert len(db_parent.sub_categories) == 1
    assert db_parent.sub_categories[0].name == "Python"
    assert db_parent.sub_categories[0].parent_category.name == "Programming"
