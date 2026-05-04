"""
Tests for backend/app/core/seeds/ — init_categories, init_role_request_options,
and the top-level init_static_data orchestrator.
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from sqlalchemy import select

from app.models import TaskRequirementCategory, RoleRequestInfoOption
from app.core.seeds.categories import init_categories
from app.core.seeds.role_requests import init_role_request_options
from app.core.seeds import init_static_data


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_category_list(parents=None, children=None):
    parents = parents or []
    children = children or []
    return [
        {"name": p, "main_id": None, "display_name": p} for p in parents
    ] + [
        {"name": c["name"], "main_id": c["parent"], "display_name": c["name"]}
        for c in children
    ]


# ---------------------------------------------------------------------------
# init_categories — parent-only cases
# ---------------------------------------------------------------------------

async def test_init_categories_inserts_parent(db_session, monkeypatch):
    monkeypatch.setattr(
        "app.core.seeds.categories.settings",
        MagicMock(CATEGORY_LIST=[{"name": "Backend", "main_id": None}]),
    )

    await init_categories(db_session)

    result = await db_session.execute(
        select(TaskRequirementCategory).where(TaskRequirementCategory.name == "Backend")
    )
    category = result.scalar_one_or_none()
    assert category is not None
    assert category.name == "Backend"
    assert category.main_id is None


async def test_init_categories_inserts_multiple_parents(db_session, monkeypatch):
    monkeypatch.setattr(
        "app.core.seeds.categories.settings",
        MagicMock(CATEGORY_LIST=[
            {"name": "Backend", "main_id": None},
            {"name": "Frontend", "main_id": None},
            {"name": "Databases", "main_id": None},
        ]),
    )

    await init_categories(db_session)

    result = await db_session.execute(select(TaskRequirementCategory))
    categories = result.scalars().all()
    names = {c.name for c in categories}
    assert {"Backend", "Frontend", "Databases"} == names


async def test_init_categories_idempotent_parents(db_session, monkeypatch):
    """Running init_categories twice must not create duplicate parent rows."""
    cat_list = [{"name": "Languages", "main_id": None}]
    monkeypatch.setattr(
        "app.core.seeds.categories.settings",
        MagicMock(CATEGORY_LIST=cat_list),
    )

    await init_categories(db_session)
    await init_categories(db_session)

    result = await db_session.execute(select(TaskRequirementCategory))
    categories = result.scalars().all()
    assert len(categories) == 1


# ---------------------------------------------------------------------------
# init_categories — child cases
# ---------------------------------------------------------------------------

async def test_init_categories_inserts_child_after_parent(db_session, monkeypatch):
    cat_list = [
        {"name": "Databases", "main_id": None},
        {"name": "SQL", "main_id": "Databases"},
    ]
    monkeypatch.setattr(
        "app.core.seeds.categories.settings",
        MagicMock(CATEGORY_LIST=cat_list),
    )

    await init_categories(db_session)

    result = await db_session.execute(
        select(TaskRequirementCategory).where(TaskRequirementCategory.name == "SQL")
    )
    child = result.scalar_one_or_none()
    assert child is not None
    assert child.main_id == "Databases"


async def test_init_categories_child_skipped_without_parent(db_session, monkeypatch):
    """A child whose parent doesn't exist in the DB must not be inserted."""
    cat_list = [
        # "MissingParent" is NOT in the list — so "OrphanChild" should be skipped
        {"name": "OrphanChild", "main_id": "MissingParent"},
    ]
    monkeypatch.setattr(
        "app.core.seeds.categories.settings",
        MagicMock(CATEGORY_LIST=cat_list),
    )

    await init_categories(db_session)

    result = await db_session.execute(select(TaskRequirementCategory))
    categories = result.scalars().all()
    assert len(categories) == 0


async def test_init_categories_idempotent_children(db_session, monkeypatch):
    """Running init_categories twice must not duplicate children."""
    cat_list = [
        {"name": "Infrastructure", "main_id": None},
        {"name": "DevOps", "main_id": "Infrastructure"},
    ]
    monkeypatch.setattr(
        "app.core.seeds.categories.settings",
        MagicMock(CATEGORY_LIST=cat_list),
    )

    await init_categories(db_session)
    await init_categories(db_session)

    result = await db_session.execute(select(TaskRequirementCategory))
    categories = result.scalars().all()
    assert len(categories) == 2


async def test_init_categories_multiple_children_same_parent(db_session, monkeypatch):
    cat_list = [
        {"name": "Frontend", "main_id": None},
        {"name": "JS Frameworks", "main_id": "Frontend"},
        {"name": "State Management", "main_id": "Frontend"},
    ]
    monkeypatch.setattr(
        "app.core.seeds.categories.settings",
        MagicMock(CATEGORY_LIST=cat_list),
    )

    await init_categories(db_session)

    result = await db_session.execute(select(TaskRequirementCategory))
    categories = result.scalars().all()
    assert len(categories) == 3
    child_names = {c.name for c in categories if c.main_id is not None}
    assert child_names == {"JS Frameworks", "State Management"}


async def test_init_categories_empty_list(db_session, monkeypatch):
    monkeypatch.setattr(
        "app.core.seeds.categories.settings",
        MagicMock(CATEGORY_LIST=[]),
    )

    await init_categories(db_session)

    result = await db_session.execute(select(TaskRequirementCategory))
    assert result.scalars().all() == []


async def test_init_categories_parent_display_name_equals_name(db_session, monkeypatch):
    """The code sets display_name=item['name'] for parents."""
    cat_list = [{"name": "Mobile", "main_id": None}]
    monkeypatch.setattr(
        "app.core.seeds.categories.settings",
        MagicMock(CATEGORY_LIST=cat_list),
    )

    await init_categories(db_session)

    result = await db_session.execute(
        select(TaskRequirementCategory).where(TaskRequirementCategory.name == "Mobile")
    )
    cat = result.scalar_one_or_none()
    assert cat.display_name == "Mobile"


# ---------------------------------------------------------------------------
# init_role_request_options — insert cases
# ---------------------------------------------------------------------------

async def test_init_role_request_options_inserts_new(db_session, monkeypatch):
    opts = [{"name": "fullName", "display_name": "Full Name"}]
    monkeypatch.setattr(
        "app.core.seeds.role_requests.settings",
        MagicMock(ROLE_REQUEST_INFO_OPTIONS=opts),
    )

    await init_role_request_options(db_session)

    result = await db_session.execute(
        select(RoleRequestInfoOption).where(RoleRequestInfoOption.name == "fullName")
    )
    opt = result.scalar_one_or_none()
    assert opt is not None
    assert opt.display_name == "Full Name"


async def test_init_role_request_options_inserts_multiple(db_session, monkeypatch):
    opts = [
        {"name": "fullName", "display_name": "Full Name"},
        {"name": "contact", "display_name": "Contact Information"},
        {"name": "age", "display_name": "Age"},
    ]
    monkeypatch.setattr(
        "app.core.seeds.role_requests.settings",
        MagicMock(ROLE_REQUEST_INFO_OPTIONS=opts),
    )

    await init_role_request_options(db_session)

    result = await db_session.execute(select(RoleRequestInfoOption))
    rows = result.scalars().all()
    assert len(rows) == 3


async def test_init_role_request_options_idempotent(db_session, monkeypatch):
    """Running twice must not insert duplicate rows."""
    opts = [{"name": "experience", "display_name": "Experience"}]
    mock_settings = MagicMock(ROLE_REQUEST_INFO_OPTIONS=opts)
    monkeypatch.setattr("app.core.seeds.role_requests.settings", mock_settings)

    await init_role_request_options(db_session)
    await init_role_request_options(db_session)

    result = await db_session.execute(select(RoleRequestInfoOption))
    rows = result.scalars().all()
    assert len(rows) == 1


# ---------------------------------------------------------------------------
# init_role_request_options — update cases
# ---------------------------------------------------------------------------

async def test_init_role_request_options_updates_display_name(db_session, monkeypatch):
    """When display_name changes, the existing row must be updated."""
    # First run: insert original
    opts_v1 = [{"name": "reason", "display_name": "Reason"}]
    monkeypatch.setattr(
        "app.core.seeds.role_requests.settings",
        MagicMock(ROLE_REQUEST_INFO_OPTIONS=opts_v1),
    )
    await init_role_request_options(db_session)

    # Second run: updated display_name
    opts_v2 = [{"name": "reason", "display_name": "Reason for Request"}]
    monkeypatch.setattr(
        "app.core.seeds.role_requests.settings",
        MagicMock(ROLE_REQUEST_INFO_OPTIONS=opts_v2),
    )
    await init_role_request_options(db_session)

    result = await db_session.execute(
        select(RoleRequestInfoOption).where(RoleRequestInfoOption.name == "reason")
    )
    opt = result.scalar_one_or_none()
    assert opt is not None
    assert opt.display_name == "Reason for Request"


async def test_init_role_request_options_no_change_same_display_name(db_session, monkeypatch):
    """When display_name is unchanged, the row should remain intact."""
    opts = [{"name": "plans", "display_name": "Future Plans"}]
    monkeypatch.setattr(
        "app.core.seeds.role_requests.settings",
        MagicMock(ROLE_REQUEST_INFO_OPTIONS=opts),
    )

    await init_role_request_options(db_session)
    await init_role_request_options(db_session)

    result = await db_session.execute(select(RoleRequestInfoOption))
    rows = result.scalars().all()
    assert len(rows) == 1
    assert rows[0].display_name == "Future Plans"


async def test_init_role_request_options_empty_list(db_session, monkeypatch):
    monkeypatch.setattr(
        "app.core.seeds.role_requests.settings",
        MagicMock(ROLE_REQUEST_INFO_OPTIONS=[]),
    )

    await init_role_request_options(db_session)

    result = await db_session.execute(select(RoleRequestInfoOption))
    assert result.scalars().all() == []


# ---------------------------------------------------------------------------
# init_static_data — orchestration
# ---------------------------------------------------------------------------

async def test_init_static_data_calls_all_seed_functions(db_session, monkeypatch):
    """init_static_data must call all five individual seed functions."""
    call_log = []

    async def fake_init_roles(session):
        call_log.append("roles")

    async def fake_init_tournament_statuses(session):
        call_log.append("tournament_statuses")

    async def fake_init_task_statuses(session):
        call_log.append("task_statuses")

    async def fake_init_categories(session):
        call_log.append("categories")

    async def fake_init_role_request_options(session):
        call_log.append("role_request_options")

    monkeypatch.setattr("app.core.seeds.init_roles", fake_init_roles)
    monkeypatch.setattr("app.core.seeds.init_tournament_statuses", fake_init_tournament_statuses)
    monkeypatch.setattr("app.core.seeds.init_task_statuses", fake_init_task_statuses)
    monkeypatch.setattr("app.core.seeds.init_categories", fake_init_categories)
    monkeypatch.setattr("app.core.seeds.init_role_request_options", fake_init_role_request_options)

    await init_static_data(db_session)

    assert call_log == [
        "roles",
        "tournament_statuses",
        "task_statuses",
        "categories",
        "role_request_options",
    ]


async def test_init_static_data_passes_session_to_each(db_session, monkeypatch):
    """Each seed function must receive the same session object."""
    received_sessions = []

    async def capture(session):
        received_sessions.append(session)

    monkeypatch.setattr("app.core.seeds.init_roles", capture)
    monkeypatch.setattr("app.core.seeds.init_tournament_statuses", capture)
    monkeypatch.setattr("app.core.seeds.init_task_statuses", capture)
    monkeypatch.setattr("app.core.seeds.init_categories", capture)
    monkeypatch.setattr("app.core.seeds.init_role_request_options", capture)

    await init_static_data(db_session)

    assert len(received_sessions) == 5
    for s in received_sessions:
        assert s is db_session


async def test_init_static_data_integration(db_session, monkeypatch):
    """
    Full integration smoke-test: use a minimal real config so all seeds run
    against the in-memory SQLite DB without hitting Firebase or the network.
    """
    from unittest.mock import MagicMock
    from app.config import SharedAppConfig, RoleConfig, OptionConfig, CategoryConfig
    from app.models import Role, TournamentStatusOption, TaskStatusOption

    minimal_config = SharedAppConfig.model_validate({
        "roles": [{"name": "user", "display_name": "User", "description": "User."}],
        "tournament_statuses": [{"name": "draft", "display_name": "Draft"}],
        "task_statuses": [{"name": "draft", "display_name": "Draft"}],
        "categories": [{"name": "Backend", "main_id": None}],
        "role_request_options": [{"name": "fullName", "display_name": "Full Name"}],
    })

    fake_settings = MagicMock()
    fake_settings.ROLE_OPTIONS = [r.model_dump() for r in minimal_config.roles]
    fake_settings.TOURNAMENT_STATUS_OPTIONS = [s.model_dump() for s in minimal_config.tournament_statuses]
    fake_settings.TASK_STATUS_OPTIONS = [s.model_dump() for s in minimal_config.task_statuses]
    fake_settings.CATEGORY_LIST = [c.model_dump() for c in minimal_config.categories]
    fake_settings.ROLE_REQUEST_INFO_OPTIONS = [o.model_dump() for o in minimal_config.role_request_options]

    monkeypatch.setattr("app.core.seeds.roles.settings", fake_settings)
    monkeypatch.setattr("app.core.seeds.status.settings", fake_settings)
    monkeypatch.setattr("app.core.seeds.categories.settings", fake_settings)
    monkeypatch.setattr("app.core.seeds.role_requests.settings", fake_settings)

    await init_static_data(db_session)

    roles = (await db_session.execute(select(Role))).scalars().all()
    assert any(r.name == "user" for r in roles)

    t_statuses = (await db_session.execute(select(TournamentStatusOption))).scalars().all()
    assert any(s.name == "draft" for s in t_statuses)

    tk_statuses = (await db_session.execute(select(TaskStatusOption))).scalars().all()
    assert any(s.name == "draft" for s in tk_statuses)

    cats = (await db_session.execute(select(TaskRequirementCategory))).scalars().all()
    assert any(c.name == "Backend" for c in cats)

    opts = (await db_session.execute(select(RoleRequestInfoOption))).scalars().all()
    assert any(o.name == "fullName" for o in opts)
