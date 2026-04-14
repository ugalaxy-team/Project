import pytest
from typing import get_type_hints, get_args, get_origin, Annotated

from app.dependencies.current_user import get_current_user, CurrentUserDep
from app.dependencies.session import SessionDep, get_session
from app.models import User
from sqlalchemy.ext.asyncio import AsyncSession


# ---- get_current_user tests ----

async def test_get_current_user_raises_not_implemented():
    """get_current_user raises NotImplementedError - auth not yet implemented."""
    with pytest.raises(NotImplementedError):
        await get_current_user()


async def test_get_current_user_error_message():
    """NotImplementedError has descriptive message."""
    with pytest.raises(NotImplementedError) as exc_info:
        await get_current_user()
    assert "Authentication logic" in str(exc_info.value)


async def test_get_current_user_is_coroutine():
    """get_current_user is an async function (coroutine function)."""
    import asyncio
    assert asyncio.iscoroutinefunction(get_current_user)


def test_current_user_dep_is_annotated():
    """CurrentUserDep is an Annotated type."""
    assert get_origin(CurrentUserDep) is Annotated


def test_current_user_dep_user_type():
    """CurrentUserDep resolves to User type."""
    args = get_args(CurrentUserDep)
    assert args[0] is User


# ---- SessionDep tests ----

def test_session_dep_is_annotated():
    """SessionDep is an Annotated type."""
    assert get_origin(SessionDep) is Annotated


def test_session_dep_async_session_type():
    """SessionDep resolves to AsyncSession."""
    args = get_args(SessionDep)
    assert args[0] is AsyncSession


async def test_get_session_yields_async_session(db_session):
    """get_session (from app.db) yields an AsyncSession."""
    assert isinstance(db_session, AsyncSession)


async def test_session_dep_get_session_function():
    """SessionDep wraps get_session from app.db."""
    from app.db import get_session as db_get_session
    from fastapi import Depends
    args = get_args(SessionDep)
    # The second arg should be a Depends wrapping get_session
    depends = args[1]
    assert depends.dependency is db_get_session


# ---- dependencies __init__ re-exports ----

def test_dependencies_init_exports_current_user_dep():
    from app.dependencies import CurrentUserDep as dep
    assert dep is not None


def test_dependencies_init_exports_get_current_user():
    from app.dependencies import get_current_user as func
    assert func is not None


def test_dependencies_init_exports_session_dep():
    from app.dependencies import SessionDep as dep
    assert dep is not None


def test_dependencies_init_exports_get_session():
    from app.dependencies import get_session as func
    assert func is not None