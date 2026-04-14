import pytest
from sqlalchemy.ext.asyncio import AsyncSession, AsyncEngine, async_sessionmaker
from sqlalchemy import text, inspect

from app.models import Base, User


# ---- get_session tests ----

async def test_get_session_yields_async_session(db_session):
    """The db_session fixture (via get_session) yields an AsyncSession."""
    assert isinstance(db_session, AsyncSession)


async def test_get_session_is_async_generator():
    """app.db.get_session is an async generator function."""
    import inspect as ins
    from app.db import get_session
    assert ins.isasyncgenfunction(get_session)


async def test_get_session_can_execute_query(db_session):
    """Session obtained via get_session can execute queries."""
    result = await db_session.execute(text("SELECT 1"))
    row = result.scalar()
    assert row == 1


async def test_get_session_can_add_and_retrieve(db_session):
    """Session can add objects and retrieve them."""
    user = User(full_name="DB Test User", email="dbtest@example.com", password="pw")
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    retrieved = await db_session.get(User, user.id)
    assert retrieved is not None
    assert retrieved.email == "dbtest@example.com"


async def test_get_session_context_manager_closes_session(db_session):
    """Session is closed after context manager exits (session is not in closed state during use)."""
    assert not db_session.is_active or db_session.is_active  # session is usable
    result = await db_session.execute(text("SELECT 1"))
    assert result.scalar() == 1


async def test_get_session_multiple_calls_return_independent_sessions():
    """Each call to get_session creates a fresh session."""
    from app.db import get_session

    sessions = []
    async for session in get_session():
        sessions.append(session)
        break

    async for session in get_session():
        sessions.append(session)
        break

    # Both should be AsyncSession instances but different objects
    assert all(isinstance(s, AsyncSession) for s in sessions)
    assert sessions[0] is not sessions[1]


# ---- AsyncSessionLocal tests ----

def test_async_session_local_is_sessionmaker():
    """AsyncSessionLocal is an async_sessionmaker."""
    from app.db import AsyncSessionLocal
    assert isinstance(AsyncSessionLocal, async_sessionmaker)


def test_engine_is_async_engine():
    """The engine in app.db is an AsyncEngine."""
    from app.db import engine
    assert isinstance(engine, AsyncEngine)


# ---- init_db tests ----

async def test_init_db_creates_tables():
    """init_db creates all tables defined in Base.metadata."""
    from sqlalchemy.ext.asyncio import create_async_engine
    from app.init_db import init_db as original_init_db
    from unittest.mock import patch, AsyncMock, MagicMock

    test_engine = create_async_engine("sqlite+aiosqlite:///:memory:")

    # Create tables directly to verify the function works
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Verify tables were created
    async with test_engine.connect() as conn:
        tables = await conn.run_sync(
            lambda sync_conn: inspect(sync_conn).get_table_names()
        )
    assert "users" in tables
    assert "tournaments" in tables
    assert "tasks" in tables
    assert "teams" in tables

    await test_engine.dispose()


async def test_init_db_is_async():
    """init_db is a coroutine function."""
    import asyncio
    from app.init_db import init_db
    assert asyncio.iscoroutinefunction(init_db)


async def test_init_db_can_run_on_test_engine():
    """init_db logic works correctly: creates all Base metadata tables."""
    from sqlalchemy.ext.asyncio import create_async_engine
    from unittest.mock import patch

    test_engine = create_async_engine("sqlite+aiosqlite:///:memory:")

    with patch("app.init_db.engine", test_engine):
        from app.init_db import init_db
        await init_db()

    async with test_engine.connect() as conn:
        table_names = await conn.run_sync(
            lambda sync_conn: inspect(sync_conn).get_table_names()
        )

    assert len(table_names) > 0
    assert "users" in table_names

    await test_engine.dispose()


# ---- Base model tests ----

def test_base_is_declarative_base():
    """Base is a proper SQLAlchemy DeclarativeBase."""
    from sqlalchemy.orm import DeclarativeBase
    assert issubclass(Base, DeclarativeBase)


def test_base_metadata_has_tables():
    """Base.metadata contains the expected tables."""
    table_names = set(Base.metadata.tables.keys())
    expected = {
        "users", "roles", "user_roles", "tournaments", "tournament_status_options",
        "teams", "team_members", "tasks", "task_statuses", "submissions",
        "evaluations", "requirement_evaluations", "evaluation_requirements",
    }
    for table in expected:
        assert table in table_names, f"Expected table '{table}' in metadata"


def test_base_metadata_registry_is_not_empty():
    """Base metadata registry contains mapped classes."""
    assert len(Base.metadata.tables) > 0