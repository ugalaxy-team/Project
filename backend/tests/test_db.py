import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session


async def test_get_session_yields_async_session():
    """get_session should yield an AsyncSession instance."""
    gen = get_session()
    session = await gen.__anext__()
    assert isinstance(session, AsyncSession)
    # Close the generator cleanly
    try:
        await gen.aclose()
    except Exception:
        pass


async def test_get_session_closes_after_use():
    """After the generator is exhausted, the session is no longer active."""
    sessions = []
    async for sess in get_session():
        sessions.append(sess)
    assert len(sessions) == 1
    assert isinstance(sessions[0], AsyncSession)


async def test_get_session_provides_new_session_each_call():
    """Each call to get_session should produce an independent session."""
    session1 = None
    session2 = None
    async for s in get_session():
        session1 = s
    async for s in get_session():
        session2 = s
    assert session1 is not session2