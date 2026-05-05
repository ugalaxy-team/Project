import pytest
from unittest.mock import patch
from string import Template

from app.config import Settings, settings


def test_settings_is_singleton_like():
    """The module-level `settings` object is reused across imports."""
    from app.config import settings as s2
    assert settings is s2


def test_cors_origins_defaults():
    s = Settings(
        SECRET_KEY="test-key",
        SQLALCHEMY_DATABASE_URI="sqlite+aiosqlite:///:memory:",
    )
    assert "http://localhost" in s.CORS_ORIGINS
    assert "http://localhost:5173" in s.CORS_ORIGINS
    assert len(s.CORS_ORIGINS) == 2


def test_cors_origins_are_strings():
    s = Settings(
        SECRET_KEY="test-key",
        SQLALCHEMY_DATABASE_URI="sqlite+aiosqlite:///:memory:",
    )
    for origin in s.CORS_ORIGINS:
        assert isinstance(origin, str)


def test_role_request_notification_message_has_placeholders():
    s = Settings(
        SECRET_KEY="test-key",
        SQLALCHEMY_DATABASE_URI="sqlite+aiosqlite:///:memory:",
    )
    rendered = Template(s.ROLE_REQUEST_NOTIFICATION_MESSAGE).substitute(
        user="alice", role="admin"
    )
    assert "alice" in rendered
    assert "admin" in rendered


def test_role_request_approved_message_has_role_placeholder():
    s = Settings(
        SECRET_KEY="test-key",
        SQLALCHEMY_DATABASE_URI="sqlite+aiosqlite:///:memory:",
    )
    rendered = Template(s.ROLE_REQUEST_APPROVED_MESSAGE).substitute(role="jury")
    assert "jury" in rendered


def test_role_request_rejected_message_has_role_placeholder():
    s = Settings(
        SECRET_KEY="test-key",
        SQLALCHEMY_DATABASE_URI="sqlite+aiosqlite:///:memory:",
    )
    rendered = Template(s.ROLE_REQUEST_REJECTED_MESSAGE).substitute(role="moderator")
    assert "moderator" in rendered


def test_settings_secret_key_from_constructor():
    s = Settings(
        SECRET_KEY="my-secret",
        SQLALCHEMY_DATABASE_URI="sqlite+aiosqlite:///:memory:",
    )
    assert s.SECRET_KEY == "my-secret"


def test_settings_database_uri_from_constructor():
    uri = "postgresql+asyncpg://user:pass@localhost/testdb"
    s = Settings(
        SECRET_KEY="key",
        SQLALCHEMY_DATABASE_URI=uri,
    )
    assert s.SQLALCHEMY_DATABASE_URI == uri


def test_settings_secret_key_from_env(monkeypatch):
    monkeypatch.setenv("SECRET_KEY", "env-secret")
    monkeypatch.setenv("SQLALCHEMY_DATABASE_URI", "sqlite+aiosqlite:///:memory:")
    s = Settings()
    assert s.SECRET_KEY == "env-secret"


def test_settings_database_uri_from_env(monkeypatch):
    monkeypatch.setenv("SECRET_KEY", "key")
    uri = "postgresql+asyncpg://u:p@host/db"
    monkeypatch.setenv("SQLALCHEMY_DATABASE_URI", uri)
    s = Settings()
    assert s.SQLALCHEMY_DATABASE_URI == uri


def test_role_request_notification_message_missing_placeholder_raises():
    """Substituting with missing kwargs should raise KeyError/ValueError."""
    s = Settings(
        SECRET_KEY="key",
        SQLALCHEMY_DATABASE_URI="sqlite+aiosqlite:///:memory:",
    )
    # Message needs both $user and $role; omitting one should fail
    with pytest.raises((KeyError, ValueError)):
        Template(s.ROLE_REQUEST_NOTIFICATION_MESSAGE).substitute(user="alice")


def test_settings_cors_origins_can_be_overridden(monkeypatch):
    monkeypatch.setenv("SECRET_KEY", "key")
    monkeypatch.setenv("SQLALCHEMY_DATABASE_URI", "sqlite+aiosqlite:///:memory:")
    monkeypatch.setenv("CORS_ORIGINS", '["http://example.com"]')
    s = Settings()
    assert "http://example.com" in s.CORS_ORIGINS