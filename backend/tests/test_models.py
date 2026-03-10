import pytest
from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
from app.models import (
    User,
    TeamMember,
    Team,
    Task,
    Tournament,
    TournamentStatusOption,
    TaskRequirementCategory,
    TaskRequirementOption,
    Submission,
    SubmissionUrl,
    SubmissionUrlOption,
)

from .factories import (
    UserFactory,
    RoleFactory,
    TournamentStatusOptionFactory,
    TournamentFactory,
    TeamFactory,
    TeamMemberFactory,
    TaskStatusOptionFactory,
    TaskFactory,
    TaskRequirementCategoryFactory,
    TaskRequirementOptionFactory,
    SubmissionFactory,
    SubmissionUrlFactory,
    SubmissionUrlOptionFactory,
)


# USER TESTS
async def test_create_user(create):
    user = await create(UserFactory)
    assert user.id is not None
    assert user.full_name is not None
    assert user.email is not None
    assert user.created_at is not None


async def test_create_user_duplicate_email(db_session, create):
    user1 = await create(UserFactory)

    duplicate_user = UserFactory.build(email=user1.email)
    db_session.add(duplicate_user)

    with pytest.raises(IntegrityError):
        await db_session.flush()

    await db_session.rollback()


async def test_create_user_without_password(create):
    with pytest.raises(IntegrityError):
        await create(UserFactory, password=None)


# ROLE TESTS
async def test_create_role(create):
    role = await create(RoleFactory, name="jury")
    assert role.id is not None
    assert role.name == "jury"


async def test_role_name_unique_constraint(create):
    await create(RoleFactory, name="jury")

    with pytest.raises(IntegrityError):
        await create(RoleFactory, name="jury")


async def test_user_roles_relationship(db_session, create):
    user = await create(UserFactory)
    role_jury = await create(RoleFactory, name="jury")
    role_admin = await create(RoleFactory, name="admin")

    stmt = select(User).where(User.id == user.id).options(selectinload(User.roles))
    result = await db_session.execute(stmt)
    user = result.unique().scalar_one()

    user.roles.extend([role_jury, role_admin])
    await db_session.commit()

    stmt_check = (
        select(User).where(User.id == user.id).options(selectinload(User.roles))
    )
    result_check = await db_session.execute(stmt_check)
    db_user = result_check.unique().scalar_one()

    assert len(db_user.roles) == 2
    assert "admin" in [r.name for r in db_user.roles]


# TEAM/TEAM MEMBER TESTS
async def test_create_team_member(create):
    member = await create(TeamMemberFactory)

    assert member.id is not None
    assert member.team_id == member.team.id


async def test_team_member_without_data(db_session):
    member = TeamMember()
    db_session.add(member)

    with pytest.raises(IntegrityError):
        await db_session.flush()
    await db_session.rollback()


async def test_team_member_duplicate_email(create, db_session):
    team = await create(TeamFactory)
    member1 = await create(TeamMemberFactory, team=team)

    duplicate = TeamMemberFactory.build(email=member1.email, team=team)
    db_session.add(duplicate)

    with pytest.raises(IntegrityError):
        await db_session.flush()

    await db_session.rollback()


async def test_create_team(create):
    team = await create(TeamFactory)
    assert team.id is not None
    assert team.name is not None
    assert team.team_email is not None


async def test_team_without_data(db_session):
    member = TeamMember()
    db_session.add(member)
    with pytest.raises(IntegrityError):
        await db_session.flush()

    await db_session.rollback()


async def test_team_duplicate_email(db_session, create):
    await create(TeamFactory)

    with pytest.raises(IntegrityError):
        await create(TeamFactory)

    await db_session.rollback()


async def test_set_team_captain(db_session, create):
    team = await create(TeamFactory)
    member = await create(TeamMemberFactory, team=team)
    team.captain_id = member.id
    db_session.add(team)
    await db_session.commit()
    await db_session.refresh(team)

    assert team.captain_id == member.id
    assert team.captain_id == member.id
    assert team.captain_id == member.id


async def test_team_team_member_relationship(db_session, create):
    team = await create(TeamFactory)
    member = await create(TeamMemberFactory, team=team)

    stmt = select(Team).where(Team.id == team.id).options(selectinload(Team.members))
    result = await db_session.execute(stmt)
    db_team = result.unique().scalar_one()

    assert len(db_team.members) == 1
    assert db_team.members[0].id == member.id


async def test_team_cascade_delete_members(db_session, create):
    team = await create(TeamFactory)
    member = await create(TeamMemberFactory, team=team)
    member_id = member.id

    await db_session.delete(team)
    await db_session.commit()

    stmt = select(TeamMember).where(TeamMember.id == member_id)
    result = await db_session.execute(stmt)
    assert result.scalar_one_or_none() is None


# TASK TESTS
async def test_create_task(create):
    task = await create(TaskFactory)

    assert task.id is not None
    assert task.title is not None
    assert task.tournament_id is not None
    assert task.status_id in ["draft", "active", "finished"]


async def test_task_requirements_relationship(db_session, create):
    category = await create(TaskRequirementCategoryFactory)
    option = await create(TaskRequirementOptionFactory, category=category)
    task = await create(TaskFactory, requirements=[option])

    stmt = (
        select(Task).where(Task.id == task.id).options(selectinload(Task.requirements))
    )

    result = await db_session.execute(stmt)
    db_task = result.unique().scalar_one()

    assert len(db_task.requirements) == 1
    assert db_task.requirements[0].name == option.name


async def test_task_without_data(db_session):
    task = Task()
    db_session.add(task)
    with pytest.raises(IntegrityError):
        await db_session.flush()
    await db_session.rollback()


async def test_task_invalid_time(create):
    task = await create(
        TaskFactory,
        start_time=datetime.now(),
        end_time=datetime.now() - timedelta(hours=1),
    )

    assert task.end_time < task.start_time


async def test_task_category_hierarchy(db_session, create):
    parent = await create(TaskRequirementCategoryFactory)
    child = await create(TaskRequirementCategoryFactory, main_id=parent.name)

    stmt = (
        select(TaskRequirementCategory)
        .where(TaskRequirementCategory.name == parent.name)
        .options(selectinload(TaskRequirementCategory.sub_categories))
    )

    result = await db_session.execute(stmt)
    db_parent = result.unique().scalar_one()

    assert len(db_parent.sub_categories) == 1
    assert db_parent.sub_categories[0].name == child.name
    assert db_parent.sub_categories[0].parent_category.name == parent.name


# TOURNAMENT TESTS
async def test_create_tournament(create):
    tournament = await create(TournamentFactory)

    assert tournament.title is not None
    assert tournament.description is not None
    assert tournament.max_team is not None


async def test_tournament_without_data(db_session):
    tournament = Tournament()
    db_session.add(tournament)
    with pytest.raises(IntegrityError):
        await db_session.flush()

    await db_session.rollback()


async def test_tournament_invalid_time(create):
    tournament = await create(
        TournamentFactory,
        reg_start=datetime.now() + timedelta(days=1),
        reg_end=datetime.now() - timedelta(hours=1),
    )

    assert tournament.reg_end < tournament.reg_start


async def test_tournament_without_creator(db_session, create):
    with pytest.raises(IntegrityError):
        await create(TournamentFactory, creator=None)

    await db_session.rollback()


async def test_tournament_creator_relationship(db_session, create):
    tournament = await create(TournamentFactory)

    stmt = (
        select(Tournament)
        .where(Tournament.id == tournament.id)
        .options(selectinload(Tournament.creator))
    )

    result = await db_session.execute(stmt)
    db_tournament = result.scalar_one()

    assert db_tournament.creator is not None
    assert db_tournament.creator.id == tournament.creator.id


async def test_tournament_status_relationship(db_session, create):
    tournament = await create(TournamentFactory)

    stmt = (
        select(Tournament)
        .where(Tournament.id == tournament.id)
        .options(selectinload(Tournament.status))
    )

    result = await db_session.execute(stmt)
    db_tournament = result.scalar_one()

    assert db_tournament.status is not None
    assert db_tournament.status.name in [
        "Registration Open",
        "Ongoing",
        "Finished",
    ]


async def test_tournament_tasks_relationship(db_session, create):
    tournament = await create(TournamentFactory)

    await create(TaskFactory, tournament=tournament)
    await create(TaskFactory, tournament=tournament)

    stmt = (
        select(Tournament)
        .where(Tournament.id == tournament.id)
        .options(selectinload(Tournament.tasks))
    )

    result = await db_session.execute(stmt)
    db_tournament = result.scalar_one()

    assert len(db_tournament.tasks) == 2


async def test_create_tournament_status_option(db_session, create):
    tournament_status_option = await create(TournamentStatusOptionFactory)

    stmt = select(TournamentStatusOption).where(
        TournamentStatusOption.id == tournament_status_option.id
    )

    result = await db_session.execute(stmt)
    db_tournament_status_option = result.scalar_one()

    assert db_tournament_status_option.name == tournament_status_option.name


async def test_tournament_status_option_unique_name(db_session, create):
    await create(TournamentStatusOptionFactory, name="Ongoing")

    with pytest.raises(IntegrityError):
        await create(TournamentStatusOptionFactory, name="Ongoing")

    await db_session.rollback()


# SUBMISSION TESTS
async def test_create_submission(create):
    submission = await create(SubmissionFactory)

    assert submission.team_id is not None
    assert submission.team is not None


async def test_submission_urls_relationship(db_session, create):
    submission = await create(SubmissionFactory)
    await create(SubmissionUrlFactory, submission=submission)
    await create(SubmissionUrlFactory, submission=submission)

    stmt = (
        select(Submission)
        .where(Submission.team_id == submission.team_id)
        .options(selectinload(Submission.urls))
    )

    result = await db_session.execute(stmt)
    db_submission = result.scalar_one()

    assert len(db_submission.urls) == 2
