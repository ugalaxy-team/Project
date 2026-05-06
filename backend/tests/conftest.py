import sys
import pytest
from unittest.mock import MagicMock, patch
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

# Mock Firebase before importing app modules
firebase_mock = MagicMock()
with patch.dict('sys.modules', {'firebase_admin': MagicMock(), 'firebase_admin.credentials': MagicMock()}):
    from app.models import Base
    from app import app
    from app.db import get_session


TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    TEST_DATABASE_URL,
)

AsyncTestingSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)


@pytest.fixture(autouse=True)
async def setup_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture()
async def db_session():
    async with AsyncTestingSessionLocal() as session:
        yield session


@pytest.fixture
async def create(db_session):
    async def _create(factory_class, **kwargs):
        obj = factory_class.build(**kwargs)
        db_session.add(obj)
        await db_session.flush()
        return obj

    return _create


@pytest.fixture
async def client(db_session):
    async def override_get_session():
        yield db_session

    app.dependency_overrides[get_session] = override_get_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()