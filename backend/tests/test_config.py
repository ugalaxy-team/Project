import json
import pytest
from types import SimpleNamespace
from unittest.mock import patch, mock_open

from app.config import (
    RoleConfig,
    OptionConfig,
    CategoryConfig,
    SharedAppConfig,
    option_names,
    load_shared_app_config,
)


# ---------------------------------------------------------------------------
# RoleConfig
# ---------------------------------------------------------------------------

def test_role_config_valid():
    role = RoleConfig(name="admin", display_name="Admin", description="Platform administrator.")
    assert role.name == "admin"
    assert role.display_name == "Admin"
    assert role.description == "Platform administrator."


def test_role_config_missing_field():
    with pytest.raises(Exception):
        RoleConfig(name="admin", display_name="Admin")  # missing description


def test_role_config_empty_strings():
    role = RoleConfig(name="", display_name="", description="")
    assert role.name == ""
    assert role.display_name == ""
    assert role.description == ""


# ---------------------------------------------------------------------------
# OptionConfig
# ---------------------------------------------------------------------------

def test_option_config_valid():
    opt = OptionConfig(name="draft", display_name="Draft")
    assert opt.name == "draft"
    assert opt.display_name == "Draft"


def test_option_config_missing_display_name():
    with pytest.raises(Exception):
        OptionConfig(name="draft")


def test_option_config_missing_name():
    with pytest.raises(Exception):
        OptionConfig(display_name="Draft")


# ---------------------------------------------------------------------------
# CategoryConfig
# ---------------------------------------------------------------------------

def test_category_config_root_category():
    cat = CategoryConfig(name="Languages")
    assert cat.name == "Languages"
    assert cat.main_id is None


def test_category_config_child_category():
    cat = CategoryConfig(name="SQL", main_id="Databases")
    assert cat.name == "SQL"
    assert cat.main_id == "Databases"


def test_category_config_explicit_none_main_id():
    cat = CategoryConfig(name="Backend", main_id=None)
    assert cat.main_id is None


# ---------------------------------------------------------------------------
# SharedAppConfig
# ---------------------------------------------------------------------------

def _make_shared_config_data():
    return {
        "roles": [
            {"name": "user", "display_name": "User", "description": "Default user."},
            {"name": "admin", "display_name": "Admin", "description": "Administrator."},
        ],
        "tournament_statuses": [
            {"name": "draft", "display_name": "Draft"},
            {"name": "running", "display_name": "Running"},
        ],
        "task_statuses": [
            {"name": "draft", "display_name": "Draft"},
            {"name": "active", "display_name": "Active"},
        ],
        "categories": [
            {"name": "Backend", "main_id": None},
            {"name": "Frameworks", "main_id": "Backend"},
        ],
        "role_request_options": [
            {"name": "fullName", "display_name": "Full Name"},
        ],
    }


def test_shared_app_config_valid():
    data = _make_shared_config_data()
    config = SharedAppConfig.model_validate(data)
    assert len(config.roles) == 2
    assert len(config.tournament_statuses) == 2
    assert len(config.task_statuses) == 2
    assert len(config.categories) == 2
    assert len(config.role_request_options) == 1


def test_shared_app_config_roles_are_role_configs():
    data = _make_shared_config_data()
    config = SharedAppConfig.model_validate(data)
    for role in config.roles:
        assert isinstance(role, RoleConfig)


def test_shared_app_config_categories_parsed():
    data = _make_shared_config_data()
    config = SharedAppConfig.model_validate(data)
    parent = next(c for c in config.categories if c.name == "Backend")
    child = next(c for c in config.categories if c.name == "Frameworks")
    assert parent.main_id is None
    assert child.main_id == "Backend"


def test_shared_app_config_missing_required_field():
    data = _make_shared_config_data()
    del data["roles"]
    with pytest.raises(Exception):
        SharedAppConfig.model_validate(data)


def test_shared_app_config_empty_lists():
    config = SharedAppConfig.model_validate({
        "roles": [],
        "tournament_statuses": [],
        "task_statuses": [],
        "categories": [],
        "role_request_options": [],
    })
    assert config.roles == []
    assert config.tournament_statuses == []
    assert config.task_statuses == []
    assert config.categories == []
    assert config.role_request_options == []


# ---------------------------------------------------------------------------
# option_names
# ---------------------------------------------------------------------------

def test_option_names_basic():
    options = [
        OptionConfig(name="draft", display_name="Draft"),
        OptionConfig(name="running", display_name="Running"),
    ]
    ns = option_names(options)
    assert isinstance(ns, SimpleNamespace)
    assert ns.DRAFT == "draft"
    assert ns.RUNNING == "running"


def test_option_names_uppercases_key():
    options = [OptionConfig(name="submission_closed", display_name="Closed")]
    ns = option_names(options)
    assert ns.SUBMISSION_CLOSED == "submission_closed"


def test_option_names_ampersand_replacement():
    options = [OptionConfig(name="a & b", display_name="A and B")]
    ns = option_names(options)
    # "&" is replaced with "AND" but spaces are preserved in the key
    assert getattr(ns, "A AND B") == "a & b"


def test_option_names_with_role_configs():
    roles = [
        RoleConfig(name="admin", display_name="Admin", description="Administrator."),
        RoleConfig(name="organizer", display_name="Organizer", description="Organizer."),
    ]
    ns = option_names(roles)
    assert ns.ADMIN == "admin"
    assert ns.ORGANIZER == "organizer"


def test_option_names_empty_list():
    ns = option_names([])
    assert isinstance(ns, SimpleNamespace)
    assert vars(ns) == {}


def test_option_names_value_is_original_name():
    """The SimpleNamespace values should preserve the original (non-uppercased) name."""
    options = [OptionConfig(name="draft", display_name="Draft")]
    ns = option_names(options)
    assert ns.DRAFT == "draft"


# ---------------------------------------------------------------------------
# load_shared_app_config
# ---------------------------------------------------------------------------

def test_load_shared_app_config_returns_shared_app_config():
    """load_shared_app_config reads the real app_config.json from the repo."""
    config = load_shared_app_config()
    assert isinstance(config, SharedAppConfig)
    assert len(config.roles) > 0
    assert len(config.tournament_statuses) > 0
    assert len(config.task_statuses) > 0
    assert len(config.categories) > 0
    assert len(config.role_request_options) > 0


def test_load_shared_app_config_roles_have_required_names():
    config = load_shared_app_config()
    role_names_list = [r.name for r in config.roles]
    assert "admin" in role_names_list
    assert "user" in role_names_list
    assert "organizer" in role_names_list


def test_load_shared_app_config_category_parent_child_structure():
    config = load_shared_app_config()
    parent_names = {c.name for c in config.categories if c.main_id is None}
    child_cats = [c for c in config.categories if c.main_id is not None]
    # Every child must point to an existing parent
    for child in child_cats:
        assert child.main_id in parent_names


def test_load_shared_app_config_with_mocked_file(tmp_path):
    fake_data = {
        "roles": [{"name": "superuser", "display_name": "Superuser", "description": "Super."}],
        "tournament_statuses": [{"name": "draft", "display_name": "Draft"}],
        "task_statuses": [{"name": "active", "display_name": "Active"}],
        "categories": [{"name": "AI", "main_id": None}],
        "role_request_options": [{"name": "contact", "display_name": "Contact"}],
    }
    fake_file = tmp_path / "app_config.json"
    fake_file.write_text(json.dumps(fake_data), encoding="utf-8")

    import app.config as config_module
    original_path = config_module.SHARED_CONFIG_PATH
    try:
        config_module.SHARED_CONFIG_PATH = fake_file
        result = config_module.load_shared_app_config()
        assert result.roles[0].name == "superuser"
        assert result.categories[0].name == "AI"
    finally:
        config_module.SHARED_CONFIG_PATH = original_path


# ---------------------------------------------------------------------------
# Settings properties (via real shared config loaded at import time)
# ---------------------------------------------------------------------------

def test_settings_role_options_is_list_of_dicts():
    from app.config import settings
    opts = settings.ROLE_OPTIONS
    assert isinstance(opts, list)
    assert all(isinstance(o, dict) for o in opts)
    assert all("name" in o and "display_name" in o and "description" in o for o in opts)


def test_settings_tournament_status_options_is_list_of_dicts():
    from app.config import settings
    opts = settings.TOURNAMENT_STATUS_OPTIONS
    assert isinstance(opts, list)
    assert all("name" in o and "display_name" in o for o in opts)


def test_settings_task_status_options_is_list_of_dicts():
    from app.config import settings
    opts = settings.TASK_STATUS_OPTIONS
    assert isinstance(opts, list)
    assert all("name" in o and "display_name" in o for o in opts)


def test_settings_role_names_is_namespace():
    from app.config import settings
    assert isinstance(settings.ROLE_NAMES, SimpleNamespace)
    assert hasattr(settings.ROLE_NAMES, "ADMIN")
    assert settings.ROLE_NAMES.ADMIN == "admin"


def test_settings_tournament_status_names_is_namespace():
    from app.config import settings
    ns = settings.TOURNAMENT_STATUS_NAMES
    assert isinstance(ns, SimpleNamespace)
    assert hasattr(ns, "DRAFT")
    assert ns.DRAFT == "draft"


def test_settings_task_status_names_is_namespace():
    from app.config import settings
    ns = settings.TASK_STATUS_NAMES
    assert isinstance(ns, SimpleNamespace)
    assert hasattr(ns, "ACTIVE")
    assert ns.ACTIVE == "active"


def test_settings_tournament_creator_roles_contains_admin_and_organizer():
    from app.config import settings
    roles = settings.TOURNAMENT_CREATOR_ROLES
    assert isinstance(roles, list)
    assert "admin" in roles
    assert "organizer" in roles


def test_settings_role_request_option_names_is_namespace():
    from app.config import settings
    ns = settings.ROLE_REQUEST_OPTION_NAMES
    assert isinstance(ns, SimpleNamespace)
    assert hasattr(ns, "FULLNAME")
    assert ns.FULLNAME == "fullName"


def test_settings_role_request_info_options_is_list_of_dicts():
    from app.config import settings
    opts = settings.ROLE_REQUEST_INFO_OPTIONS
    assert isinstance(opts, list)
    assert all("name" in o and "display_name" in o for o in opts)


def test_settings_task_categories_is_namespace():
    from app.config import settings
    ns = settings.TASK_CATEGORIES
    assert isinstance(ns, SimpleNamespace)
    assert hasattr(ns, "LANGUAGES")
    assert ns.LANGUAGES == "Languages"


def test_settings_category_list_is_list_of_dicts():
    from app.config import settings
    cats = settings.CATEGORY_LIST
    assert isinstance(cats, list)
    assert all("name" in c for c in cats)


def test_settings_admin_session_cookie_key_default():
    from app.config import settings
    assert settings.ADMIN_SESSION_COOKIE_KEY == "admin_session_cookie"


def test_settings_cors_origins_contains_localhost():
    from app.config import settings
    assert any("localhost" in origin for origin in settings.CORS_ORIGINS)