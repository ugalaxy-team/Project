import pytest
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from app.models import (
    Base,
    User,
    Role,
    Team,
    TeamMember,
    Tournament,
    TournamentStatusOption,
    Task,
)

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    TEST_DATABASE_URL,
)

AsyncTestingSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)


@pytest.fixture(scope="function", autouse=True)
async def setup_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def db_session():
    async with AsyncTestingSessionLocal() as session:
        yield session


@pytest.fixture
async def user(db_session):
    user = User(
        full_name="Test User",
        email="test@example.com",
        password="very_strong_password",
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def role(db_session):
    role = Role(name="jury")
    db_session.add(role)
    await db_session.commit()
    await db_session.refresh(role)
    return role


@pytest.fixture
async def tournament_status(db_session):
    status = TournamentStatusOption(name="Registration Open")
    db_session.add(status)
    await db_session.commit()
    await db_session.refresh(status)
    return status


@pytest.fixture
async def tournament(db_session, user, tournament_status):
    tournament = Tournament(
        title="Test Tournament",
        description="Test Description",
        start_date=datetime.now() + timedelta(days=10),
        reg_start=datetime.now(),
        reg_end=datetime.now() + timedelta(days=5),
        max_team=50,
        status_id=tournament_status.id,
        creator_id=user.id,
        active_task_id=None,
    )
    db_session.add(tournament)
    await db_session.commit()
    await db_session.refresh(tournament)
    return tournament


@pytest.fixture
async def task(db_session, tournament):
    task = Task(
        title="Test Title",
        description="Test Description",
        tournament_id=tournament.id,
        start_time=datetime.now(),
        end_time=datetime.now() + timedelta(hours=2),
        status_id="draft",
    )

    db_session.add(task)
    await db_session.commit()
    await db_session.refresh(task)
    return task


@pytest.fixture
async def team(db_session, user, tournament):
    team = Team(
        name="Test Team",
        team_email="test@example.com",
        contact_info="0680000000",
        tournament_id=tournament.id,
        captain_id=user.id,
    )
    db_session.add(team)
    await db_session.commit()
    await db_session.refresh(team)
    return team


@pytest.fixture
async def team_member(db_session, team):
    team_member = TeamMember(
        full_name="Test Name",
        email="test@example.com",
        telegram_username="@test_username",
        educational_institution="Test Location",
        team_id=team.id,
    )
    db_session.add(team_member)
    await db_session.commit()
    await db_session.refresh(team_member)
    return team_member
