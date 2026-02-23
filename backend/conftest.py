import pytest
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from app.models import Base

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    TEST_DATABASE_URL,
)

AsyncTestingSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)


@pytest.fixture(scope="session", autouse=True)
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
        await session.rollback()
