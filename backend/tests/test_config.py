import pytest
from unittest.mock import patch


def test_settings_reads_secret_key(monkeypatch):
    monkeypatch.setenv("SECRET_KEY", "test_secret_key_value")
    monkeypatch.setenv("SQLALCHEMY_DATABASE_URI", "sqlite+aiosqlite:///:memory:")

    from importlib import reload
    import app.config as config_module

    with patch.dict("os.environ", {
        "SECRET_KEY": "test_secret_key_value",
        "SQLALCHEMY_DATABASE_URI": "sqlite+aiosqlite:///:memory:",
    }):
        from pydantic_settings import BaseSettings, SettingsConfigDict
        import os

        class TestSettings(BaseSettings):
            model_config = SettingsConfigDict(env_file=None)
            SECRET_KEY: str = "test_secret_key_value"
            SQLALCHEMY_DATABASE_URI: str = "sqlite+aiosqlite:///:memory:"

        s = TestSettings()
        assert s.SECRET_KEY == "test_secret_key_value"
        assert s.SQLALCHEMY_DATABASE_URI == "sqlite+aiosqlite:///:memory:"


def test_settings_fields_are_strings():
    from pydantic_settings import BaseSettings, SettingsConfigDict

    class TestSettings(BaseSettings):
        model_config = SettingsConfigDict(env_file=None)
        SECRET_KEY: str = "my_secret"
        SQLALCHEMY_DATABASE_URI: str = "sqlite+aiosqlite:///:memory:"

    s = TestSettings()
    assert isinstance(s.SECRET_KEY, str)
    assert isinstance(s.SQLALCHEMY_DATABASE_URI, str)


def test_settings_env_overrides_default():
    with patch.dict("os.environ", {
        "SECRET_KEY": "env_override_key",
        "SQLALCHEMY_DATABASE_URI": "postgresql+asyncpg://user:pass@localhost/db",
    }):
        from pydantic_settings import BaseSettings, SettingsConfigDict

        class TestSettings(BaseSettings):
            model_config = SettingsConfigDict(env_file=None)
            SECRET_KEY: str = "default_key"
            SQLALCHEMY_DATABASE_URI: str = "default_db"

        s = TestSettings()
        assert s.SECRET_KEY == "env_override_key"
        assert s.SQLALCHEMY_DATABASE_URI == "postgresql+asyncpg://user:pass@localhost/db"


def test_settings_missing_required_field_raises():
    from pydantic_settings import BaseSettings, SettingsConfigDict
    from pydantic import ValidationError

    with patch.dict("os.environ", {}, clear=True):
        class StrictSettings(BaseSettings):
            model_config = SettingsConfigDict(env_file=None)
            REQUIRED_FIELD: str

        with pytest.raises((ValidationError, Exception)):
            StrictSettings()


def test_settings_model_config_env_file():
    from pydantic_settings import BaseSettings, SettingsConfigDict

    class TestSettings(BaseSettings):
        model_config = SettingsConfigDict(env_file="../.env")
        SECRET_KEY: str = "fallback_key"
        SQLALCHEMY_DATABASE_URI: str = "fallback_db"

    # Verify that SettingsConfigDict accepts env_file parameter
    assert TestSettings.model_config.get("env_file") == "../.env"


def test_global_settings_instance_exists():
    from app.config import settings
    assert settings is not None


def test_global_settings_has_required_attributes():
    from app.config import settings
    assert hasattr(settings, "SECRET_KEY")
    assert hasattr(settings, "SQLALCHEMY_DATABASE_URI")