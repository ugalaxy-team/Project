"""Tests for backend/app/config.py - Pydantic models, utility functions, and Settings properties."""
import json
import pytest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch, mock_open

from pydantic import ValidationError

from app.config import (
    RoleConfig,
    OptionConfig,
    CategoryConfig,
    SharedAppConfig,
    Settings,
    option_names,
    load_shared_app_config,
)


# ---------------------------------------------------------------------------
# RoleConfig tests
# ---------------------------------------------------------------------------

class TestRoleConfig:
    def test_valid_role_config(self):
        role = RoleConfig(name="admin", display_name="Admin", description="Admin user")
        assert role.name == "admin"
        assert role.display_name == "Admin"
        assert role.description == "Admin user"

    def test_missing_name_raises(self):
        with pytest.raises(ValidationError):
            RoleConfig(display_name="Admin", description="desc")

    def test_missing_display_name_raises(self):
        with pytest.raises(ValidationError):
            RoleConfig(name="admin", description="desc")

    def test_missing_description_raises(self):
        with pytest.raises(ValidationError):
            RoleConfig(name="admin", display_name="Admin")

    def test_empty_string_values_allowed(self):
        role = RoleConfig(name="", display_name="", description="")
        assert role.name == ""
        assert role.description == ""


# ---------------------------------------------------------------------------
# OptionConfig tests
# ---------------------------------------------------------------------------

class TestOptionConfig:
    def test_valid_option_config(self):
        opt = OptionConfig(name="draft", display_name="Draft")
        assert opt.name == "draft"
        assert opt.display_name == "Draft"

    def test_missing_name_raises(self):
        with pytest.raises(ValidationError):
            OptionConfig(display_name="Draft")

    def test_missing_display_name_raises(self):
        with pytest.raises(ValidationError):
            OptionConfig(name="draft")

    def test_empty_string_values_allowed(self):
        opt = OptionConfig(name="", display_name="")
        assert opt.name == ""
        assert opt.display_name == ""


# ---------------------------------------------------------------------------
# CategoryConfig tests
# ---------------------------------------------------------------------------

class TestCategoryConfig:
    def test_category_without_main_id(self):
        cat = CategoryConfig(name="Backend")
        assert cat.name == "Backend"
        assert cat.main_id is None

    def test_category_with_main_id(self):
        cat = CategoryConfig(name="Frameworks", main_id="Backend")
        assert cat.name == "Frameworks"
        assert cat.main_id == "Backend"

    def test_explicit_none_main_id(self):
        cat = CategoryConfig(name="Frontend", main_id=None)
        assert cat.main_id is None

    def test_missing_name_raises(self):
        with pytest.raises(ValidationError):
            CategoryConfig()


# ---------------------------------------------------------------------------
# SharedAppConfig tests
# ---------------------------------------------------------------------------

class TestSharedAppConfig:
    def test_valid_full_config(self):
        config = SharedAppConfig(
            roles=[RoleConfig(name="user", display_name="User", description="Normal user")],
            tournament_statuses=[OptionConfig(name="draft", display_name="Draft")],
            task_statuses=[OptionConfig(name="active", display_name="Active")],
            categories=[CategoryConfig(name="Backend")],
            role_request_options=[OptionConfig(name="age", display_name="Age")],
        )
        assert len(config.roles) == 1
        assert len(config.tournament_statuses) == 1
        assert len(config.task_statuses) == 1
        assert len(config.categories) == 1
        assert len(config.role_request_options) == 1

    def test_empty_lists_allowed(self):
        config = SharedAppConfig(
            roles=[],
            tournament_statuses=[],
            task_statuses=[],
            categories=[],
            role_request_options=[],
        )
        assert config.roles == []
        assert config.categories == []

    def test_multiple_roles(self):
        roles = [
            RoleConfig(name="user", display_name="User", description="desc1"),
            RoleConfig(name="admin", display_name="Admin", description="desc2"),
        ]
        config = SharedAppConfig(
            roles=roles,
            tournament_statuses=[],
            task_statuses=[],
            categories=[],
            role_request_options=[],
        )
        assert len(config.roles) == 2
        assert config.roles[0].name == "user"
        assert config.roles[1].name == "admin"

    def test_missing_required_field_raises(self):
        with pytest.raises(ValidationError):
            SharedAppConfig(
                roles=[],
                tournament_statuses=[],
                task_statuses=[],
                # categories missing
                role_request_options=[],
            )


# ---------------------------------------------------------------------------
# option_names() tests
# ---------------------------------------------------------------------------

class TestOptionNames:
    def test_basic_conversion(self):
        class Opt:
            def __init__(self, name):
                self.name = name

        result = option_names([Opt("draft"), Opt("active")])
        assert isinstance(result, SimpleNamespace)
        assert result.DRAFT == "draft"
        assert result.ACTIVE == "active"

    def test_uppercase_conversion(self):
        class Opt:
            def __init__(self, name):
                self.name = name

        result = option_names([Opt("submission_closed")])
        assert result.SUBMISSION_CLOSED == "submission_closed"

    def test_ampersand_replaced_with_and(self):
        class Opt:
            def __init__(self, name):
                self.name = name

        result = option_names([Opt("Design & UI")])
        ns_dict = vars(result)
        # Key should have & replaced with AND
        assert "DESIGN AND UI" in ns_dict
        assert ns_dict["DESIGN AND UI"] == "Design & UI"

    def test_empty_list_returns_empty_namespace(self):
        result = option_names([])
        assert vars(result) == {}

    def test_preserves_original_name_as_value(self):
        class Opt:
            def __init__(self, name):
                self.name = name

        result = option_names([Opt("myRole")])
        assert result.MYROLE == "myRole"

    def test_multiple_options(self):
        class Opt:
            def __init__(self, name):
                self.name = name

        opts = [Opt("user"), Opt("admin"), Opt("organizer")]
        result = option_names(opts)
        assert result.USER == "user"
        assert result.ADMIN == "admin"
        assert result.ORGANIZER == "organizer"


# ---------------------------------------------------------------------------
# load_shared_app_config() tests
# ---------------------------------------------------------------------------

class TestLoadSharedAppConfig:
    def test_loads_actual_config_file(self):
        """Integration test: verifies the real shared/app_config.json is parseable."""
        config = load_shared_app_config()
        assert isinstance(config, SharedAppConfig)
        assert len(config.roles) > 0
        assert len(config.tournament_statuses) > 0
        assert len(config.task_statuses) > 0

    def test_config_has_expected_roles(self):
        config = load_shared_app_config()
        role_names = [r.name for r in config.roles]
        assert "user" in role_names
        assert "admin" in role_names
        assert "organizer" in role_names

    def test_config_has_tournament_statuses(self):
        config = load_shared_app_config()
        status_names = [s.name for s in config.tournament_statuses]
        assert "draft" in status_names
        assert "registration" in status_names

    def test_config_has_task_statuses(self):
        config = load_shared_app_config()
        status_names = [s.name for s in config.task_statuses]
        assert "draft" in status_names
        assert "active" in status_names

    def test_config_categories_have_hierarchy(self):
        config = load_shared_app_config()
        parent_cats = [c for c in config.categories if c.main_id is None]
        child_cats = [c for c in config.categories if c.main_id is not None]
        assert len(parent_cats) > 0
        assert len(child_cats) > 0

    def test_load_invalid_json_raises(self, tmp_path, monkeypatch):
        bad_json = tmp_path / "bad_config.json"
        bad_json.write_text("{invalid json}")
        import app.config as config_module
        monkeypatch.setattr(config_module, "SHARED_CONFIG_PATH", bad_json)
        with pytest.raises(Exception):
            load_shared_app_config()

    def test_load_valid_json_missing_field_raises(self, tmp_path, monkeypatch):
        minimal = {"roles": [], "tournament_statuses": [], "task_statuses": []}
        bad_json = tmp_path / "bad_config.json"
        bad_json.write_text(json.dumps(minimal))
        import app.config as config_module
        monkeypatch.setattr(config_module, "SHARED_CONFIG_PATH", bad_json)
        with pytest.raises(ValidationError):
            load_shared_app_config()


# ---------------------------------------------------------------------------
# Settings properties tests (using the real settings loaded from shared config)
# ---------------------------------------------------------------------------

class TestSettingsProperties:
    def test_role_options_returns_list_of_dicts(self):
        from app.config import settings
        opts = settings.ROLE_OPTIONS
        assert isinstance(opts, list)
        assert all(isinstance(o, dict) for o in opts)
        assert all("name" in o and "display_name" in o and "description" in o for o in opts)

    def test_tournament_status_options_returns_list_of_dicts(self):
        from app.config import settings
        opts = settings.TOURNAMENT_STATUS_OPTIONS
        assert isinstance(opts, list)
        assert all(isinstance(o, dict) for o in opts)
        assert all("name" in o and "display_name" in o for o in opts)

    def test_task_status_options_returns_list_of_dicts(self):
        from app.config import settings
        opts = settings.TASK_STATUS_OPTIONS
        assert isinstance(opts, list)
        assert all(isinstance(o, dict) for o in opts)

    def test_role_names_returns_simple_namespace(self):
        from app.config import settings
        names = settings.ROLE_NAMES
        assert isinstance(names, SimpleNamespace)
        assert names.ADMIN == "admin"
        assert names.USER == "user"
        assert names.ORGANIZER == "organizer"

    def test_tournament_status_names_returns_namespace(self):
        from app.config import settings
        names = settings.TOURNAMENT_STATUS_NAMES
        assert isinstance(names, SimpleNamespace)
        assert names.DRAFT == "draft"
        assert names.REGISTRATION == "registration"
        assert names.RUNNING == "running"
        assert names.FINISHED == "finished"

    def test_task_status_names_returns_namespace(self):
        from app.config import settings
        names = settings.TASK_STATUS_NAMES
        assert isinstance(names, SimpleNamespace)
        assert names.DRAFT == "draft"
        assert names.ACTIVE == "active"

    def test_tournament_creator_roles_contains_admin_and_organizer(self):
        from app.config import settings
        roles = settings.TOURNAMENT_CREATOR_ROLES
        assert isinstance(roles, list)
        assert "admin" in roles
        assert "organizer" in roles

    def test_role_request_info_options_returns_list_of_dicts(self):
        from app.config import settings
        opts = settings.ROLE_REQUEST_INFO_OPTIONS
        assert isinstance(opts, list)
        assert all(isinstance(o, dict) for o in opts)
        assert all("name" in o and "display_name" in o for o in opts)

    def test_role_request_option_names_returns_namespace(self):
        from app.config import settings
        names = settings.ROLE_REQUEST_OPTION_NAMES
        assert isinstance(names, SimpleNamespace)

    def test_category_list_returns_list_of_dicts(self):
        from app.config import settings
        cats = settings.CATEGORY_LIST
        assert isinstance(cats, list)
        assert all(isinstance(c, dict) for c in cats)
        assert all("name" in c for c in cats)

    def test_task_categories_returns_namespace(self):
        from app.config import settings
        cats = settings.TASK_CATEGORIES
        assert isinstance(cats, SimpleNamespace)

    def test_admin_session_expires_is_5_days(self):
        from app.config import settings
        from datetime import timedelta
        assert settings.ADMIN_SESSION_EXPIRES == timedelta(days=5)

    def test_admin_session_cookie_key_default(self):
        from app.config import settings
        assert settings.ADMIN_SESSION_COOKIE_KEY == "admin_session_cookie"

    def test_cors_origins_contains_localhost(self):
        from app.config import settings
        assert any("localhost" in origin for origin in settings.CORS_ORIGINS)

    def test_role_request_notification_message_contains_placeholders(self):
        from app.config import settings
        assert "$user" in settings.ROLE_REQUEST_NOTIFICATION_MESSAGE
        assert "$role" in settings.ROLE_REQUEST_NOTIFICATION_MESSAGE

    def test_role_request_approved_message_contains_role_placeholder(self):
        from app.config import settings
        assert "$role" in settings.ROLE_REQUEST_APPROVED_MESSAGE

    def test_role_request_rejected_message_contains_role_placeholder(self):
        from app.config import settings
        assert "$role" in settings.ROLE_REQUEST_REJECTED_MESSAGE