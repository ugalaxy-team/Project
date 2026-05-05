"""Tests for backend/app/dependencies/current_user.py"""
import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from fastapi import HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from firebase_admin.auth import (
    InvalidIdTokenError,
    ExpiredIdTokenError,
    RevokedIdTokenError,
    CertificateFetchError,
    UserDisabledError,
)
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.dependencies.current_user import get_current_user
from app.models import User
from tests.factories import UserFactory


def _make_bearer_token(credentials: str = "valid-token"):
    """Create a mock HTTPAuthorizationCredentials object (HTTP path)."""
    token = MagicMock(spec=HTTPAuthorizationCredentials)
    token.credentials = credentials
    return token


def _make_firebase_user(uid: str, email: str, display_name: str | None = "Test User"):
    """Create a mock firebase_admin.auth.UserRecord."""
    user_record = MagicMock()
    user_record.uid = uid
    user_record.email = email
    user_record.display_name = display_name
    return user_record


async def test_get_current_user_returns_existing_user(db_session, create):
    """Valid token for a user already in the DB returns that user."""
    user = await create(UserFactory)
    # Reload with relationships to avoid lazy-loading issues
    stmt = select(User).where(User.id == user.id).options(selectinload(User.roles))
    user = (await db_session.execute(stmt)).unique().scalar_one()

    firebase_token_data = {"email": user.email}
    firebase_user_record = _make_firebase_user(uid=user.firebase_uid, email=user.email)
    bearer_token = _make_bearer_token("valid-token")

    with (
        patch("app.dependencies.current_user.auth.verify_id_token", return_value=firebase_token_data),
        patch("app.dependencies.current_user.auth.get_user_by_email", return_value=firebase_user_record),
    ):
        result = await get_current_user(session=db_session, token=bearer_token)

    assert result.id == user.id
    assert result.email == user.email


async def test_get_current_user_creates_new_user_when_not_found(db_session, create):
    """Valid token for a user not yet in DB creates and returns a new User record."""
    uid = "new-firebase-uid-123"
    email = "newuser@example.com"
    display_name = "New User"

    firebase_token_data = {"email": email}
    firebase_user_record = _make_firebase_user(uid=uid, email=email, display_name=display_name)
    bearer_token = _make_bearer_token("valid-token")

    with (
        patch("app.dependencies.current_user.auth.verify_id_token", return_value=firebase_token_data),
        patch("app.dependencies.current_user.auth.get_user_by_email", return_value=firebase_user_record),
    ):
        result = await get_current_user(session=db_session, token=bearer_token)

    assert result.firebase_uid == uid
    assert result.email == email
    assert result.full_name == display_name
    assert result.id is not None

    # Verify it's actually in the DB
    stmt = select(User).where(User.firebase_uid == uid)
    db_user = (await db_session.execute(stmt)).scalar_one_or_none()
    assert db_user is not None


async def test_get_current_user_raises_400_when_display_name_null(db_session):
    """If Firebase user has no display_name and they aren't in the DB, raise 400."""
    uid = "no-name-uid"
    email = "nonameuser@example.com"

    firebase_token_data = {"email": email}
    firebase_user_record = _make_firebase_user(uid=uid, email=email, display_name=None)
    bearer_token = _make_bearer_token("valid-token")

    with (
        patch("app.dependencies.current_user.auth.verify_id_token", return_value=firebase_token_data),
        patch("app.dependencies.current_user.auth.get_user_by_email", return_value=firebase_user_record),
    ):
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(session=db_session, token=bearer_token)

    assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
    assert "Full name" in exc_info.value.detail


async def test_get_current_user_raises_401_on_invalid_token(db_session):
    """InvalidIdTokenError from Firebase raises HTTP 401."""
    bearer_token = _make_bearer_token("bad-token")

    with patch(
        "app.dependencies.current_user.auth.verify_id_token",
        side_effect=InvalidIdTokenError("bad token"),
    ):
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(session=db_session, token=bearer_token)

    assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Invalid id token" in exc_info.value.detail


async def test_get_current_user_raises_401_on_expired_token(db_session):
    """ExpiredIdTokenError from Firebase raises HTTP 401."""
    bearer_token = _make_bearer_token("expired-token")

    with patch(
        "app.dependencies.current_user.auth.verify_id_token",
        side_effect=ExpiredIdTokenError("expired", cause=None),
    ):
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(session=db_session, token=bearer_token)

    assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED


async def test_get_current_user_raises_401_on_revoked_token(db_session):
    """RevokedIdTokenError from Firebase raises HTTP 401."""
    bearer_token = _make_bearer_token("revoked-token")

    with patch(
        "app.dependencies.current_user.auth.verify_id_token",
        side_effect=RevokedIdTokenError("revoked"),
    ):
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(session=db_session, token=bearer_token)

    assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED


async def test_get_current_user_raises_401_on_value_error(db_session):
    """ValueError from verify_id_token raises HTTP 401."""
    bearer_token = _make_bearer_token("garbage-token")

    with patch(
        "app.dependencies.current_user.auth.verify_id_token",
        side_effect=ValueError("not a token"),
    ):
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(session=db_session, token=bearer_token)

    assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED


async def test_get_current_user_raises_401_on_user_disabled(db_session):
    """UserDisabledError from Firebase raises HTTP 401."""
    bearer_token = _make_bearer_token("disabled-token")

    with patch(
        "app.dependencies.current_user.auth.verify_id_token",
        side_effect=UserDisabledError("disabled"),
    ):
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(session=db_session, token=bearer_token)

    assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED


async def test_get_current_user_websocket_path_uses_string_token(db_session, create):
    """When token is a plain string (WebSocket), it is passed directly to verify_id_token."""
    user = await create(UserFactory)
    stmt = select(User).where(User.id == user.id).options(selectinload(User.roles))
    user = (await db_session.execute(stmt)).unique().scalar_one()

    firebase_token_data = {"email": user.email}
    firebase_user_record = _make_firebase_user(uid=user.firebase_uid, email=user.email)
    # Plain string — no 'credentials' attribute
    string_token = "plain-string-token"

    with (
        patch("app.dependencies.current_user.auth.verify_id_token", return_value=firebase_token_data) as mock_verify,
        patch("app.dependencies.current_user.auth.get_user_by_email", return_value=firebase_user_record),
    ):
        result = await get_current_user(session=db_session, token=string_token)

    # verify_id_token should be called with the raw string, not with .credentials
    mock_verify.assert_called_once()
    call_args = mock_verify.call_args[0]
    assert call_args[0] == string_token
    assert result.id == user.id


async def test_get_current_user_http_path_uses_credentials_attribute(db_session, create):
    """When token has a 'credentials' attr (HTTP), the .credentials value is passed to verify_id_token."""
    user = await create(UserFactory)
    stmt = select(User).where(User.id == user.id).options(selectinload(User.roles))
    user = (await db_session.execute(stmt)).unique().scalar_one()

    firebase_token_data = {"email": user.email}
    firebase_user_record = _make_firebase_user(uid=user.firebase_uid, email=user.email)
    bearer_token = _make_bearer_token("http-cred-value")

    with (
        patch("app.dependencies.current_user.auth.verify_id_token", return_value=firebase_token_data) as mock_verify,
        patch("app.dependencies.current_user.auth.get_user_by_email", return_value=firebase_user_record),
    ):
        result = await get_current_user(session=db_session, token=bearer_token)

    mock_verify.assert_called_once()
    call_args = mock_verify.call_args[0]
    assert call_args[0] == "http-cred-value"
    assert result.id == user.id


async def test_get_current_user_raises_401_on_certificate_fetch_error(db_session):
    """CertificateFetchError from Firebase raises HTTP 401."""
    bearer_token = _make_bearer_token("token")

    with patch(
        "app.dependencies.current_user.auth.verify_id_token",
        side_effect=CertificateFetchError(cause=Exception("fetch failed"), message="cert error"),
    ):
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(session=db_session, token=bearer_token)

    assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
