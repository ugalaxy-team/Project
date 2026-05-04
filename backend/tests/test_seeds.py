"""Tests for backend/app/core/seeds/ - database seeding functions."""
import pytest
from sqlalchemy import select
from unittest.mock import patch, AsyncMock

from app.models import TaskRequirementCategory, RoleRequestInfoOption, Role, TournamentStatusOption, TaskStatusOption
from app.core.seeds.categories import init_categories
from app.core.seeds.role_requests import init_role_request_options
from app.core.seeds import init_static_data


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_category(name, main_id=None):
    return {"name": name, "display_name": name, "main_id": main_id}


def _make_option(name, display_name):
    return {"name": name, "display_name": display_name}


# ---------------------------------------------------------------------------
# init_categories() tests
# ---------------------------------------------------------------------------

class TestInitCategories:
    async def test_inserts_parent_categories(self, db_session):
        categories = [
            _make_category("Backend"),
            _make_category("Frontend"),
        ]
        with patch("app.core.seeds.categories.settings") as mock_settings:
            mock_settings.CATEGORY_LIST = categories
            await init_categories(db_session)

        result = await db_session.execute(select(TaskRequirementCategory))
        rows = result.scalars().all()
        names = [r.name for r in rows]
        assert "Backend" in names
        assert "Frontend" in names

    async def test_inserts_child_category_when_parent_exists(self, db_session):
        categories = [
            _make_category("Backend"),
            _make_category("Frameworks", main_id="Backend"),
        ]
        with patch("app.core.seeds.categories.settings") as mock_settings:
            mock_settings.CATEGORY_LIST = categories
            await init_categories(db_session)

        result = await db_session.execute(select(TaskRequirementCategory))
        rows = result.scalars().all()
        names = [r.name for r in rows]
        assert "Backend" in names
        assert "Frameworks" in names

    async def test_skips_child_when_parent_does_not_exist(self, db_session):
        categories = [
            _make_category("Orphan", main_id="NonExistentParent"),
        ]
        with patch("app.core.seeds.categories.settings") as mock_settings:
            mock_settings.CATEGORY_LIST = categories
            await init_categories(db_session)

        result = await db_session.execute(select(TaskRequirementCategory))
        rows = result.scalars().all()
        assert len(rows) == 0

    async def test_idempotent_does_not_duplicate_parents(self, db_session):
        categories = [_make_category("Backend")]
        with patch("app.core.seeds.categories.settings") as mock_settings:
            mock_settings.CATEGORY_LIST = categories
            await init_categories(db_session)
            # Run again to test idempotency
            await init_categories(db_session)

        result = await db_session.execute(select(TaskRequirementCategory))
        rows = result.scalars().all()
        assert len(rows) == 1

    async def test_idempotent_does_not_duplicate_children(self, db_session):
        categories = [
            _make_category("Backend"),
            _make_category("Frameworks", main_id="Backend"),
        ]
        with patch("app.core.seeds.categories.settings") as mock_settings:
            mock_settings.CATEGORY_LIST = categories
            await init_categories(db_session)
            await init_categories(db_session)

        result = await db_session.execute(select(TaskRequirementCategory))
        rows = result.scalars().all()
        assert len(rows) == 2

    async def test_empty_category_list(self, db_session):
        with patch("app.core.seeds.categories.settings") as mock_settings:
            mock_settings.CATEGORY_LIST = []
            await init_categories(db_session)

        result = await db_session.execute(select(TaskRequirementCategory))
        rows = result.scalars().all()
        assert rows == []

    async def test_parent_category_has_none_main_id(self, db_session):
        categories = [_make_category("Languages")]
        with patch("app.core.seeds.categories.settings") as mock_settings:
            mock_settings.CATEGORY_LIST = categories
            await init_categories(db_session)

        result = await db_session.execute(
            select(TaskRequirementCategory).where(TaskRequirementCategory.name == "Languages")
        )
        cat = result.scalar_one_or_none()
        assert cat is not None
        assert cat.main_id is None

    async def test_child_category_has_correct_main_id(self, db_session):
        categories = [
            _make_category("Databases"),
            _make_category("SQL", main_id="Databases"),
        ]
        with patch("app.core.seeds.categories.settings") as mock_settings:
            mock_settings.CATEGORY_LIST = categories
            await init_categories(db_session)

        result = await db_session.execute(
            select(TaskRequirementCategory).where(TaskRequirementCategory.name == "SQL")
        )
        cat = result.scalar_one_or_none()
        assert cat is not None
        assert cat.main_id == "Databases"

    async def test_multiple_children_same_parent(self, db_session):
        categories = [
            _make_category("Databases"),
            _make_category("SQL", main_id="Databases"),
            _make_category("NoSQL", main_id="Databases"),
            _make_category("Vector DB", main_id="Databases"),
        ]
        with patch("app.core.seeds.categories.settings") as mock_settings:
            mock_settings.CATEGORY_LIST = categories
            await init_categories(db_session)

        result = await db_session.execute(select(TaskRequirementCategory))
        rows = result.scalars().all()
        assert len(rows) == 4

    async def test_display_name_set_to_name_for_parents(self, db_session):
        categories = [_make_category("Backend")]
        with patch("app.core.seeds.categories.settings") as mock_settings:
            mock_settings.CATEGORY_LIST = categories
            await init_categories(db_session)

        result = await db_session.execute(
            select(TaskRequirementCategory).where(TaskRequirementCategory.name == "Backend")
        )
        cat = result.scalar_one_or_none()
        assert cat.display_name == "Backend"

    async def test_uses_real_settings_categories(self, db_session):
        """Integration: uses actual settings to verify real-world data is seeded."""
        await init_categories(db_session)

        result = await db_session.execute(select(TaskRequirementCategory))
        rows = result.scalars().all()
        names = [r.name for r in rows]
        assert "Backend" in names
        assert "Frontend" in names
        assert "Databases" in names


# ---------------------------------------------------------------------------
# init_role_request_options() tests
# ---------------------------------------------------------------------------

class TestInitRoleRequestOptions:
    async def test_inserts_new_options(self, db_session):
        options = [
            _make_option("fullName", "Full Name"),
            _make_option("contact", "Contact Information"),
        ]
        with patch("app.core.seeds.role_requests.settings") as mock_settings:
            mock_settings.ROLE_REQUEST_INFO_OPTIONS = options
            await init_role_request_options(db_session)

        result = await db_session.execute(select(RoleRequestInfoOption))
        rows = result.scalars().all()
        names = [r.name for r in rows]
        assert "fullName" in names
        assert "contact" in names

    async def test_updates_display_name_when_changed(self, db_session):
        # Insert initial option
        initial = [_make_option("age", "Age")]
        with patch("app.core.seeds.role_requests.settings") as mock_settings:
            mock_settings.ROLE_REQUEST_INFO_OPTIONS = initial
            await init_role_request_options(db_session)

        # Update display_name
        updated = [_make_option("age", "Participant Age")]
        with patch("app.core.seeds.role_requests.settings") as mock_settings:
            mock_settings.ROLE_REQUEST_INFO_OPTIONS = updated
            await init_role_request_options(db_session)

        result = await db_session.execute(
            select(RoleRequestInfoOption).where(RoleRequestInfoOption.name == "age")
        )
        opt = result.scalar_one_or_none()
        assert opt is not None
        assert opt.display_name == "Participant Age"

    async def test_does_not_change_when_display_name_same(self, db_session):
        options = [_make_option("reason", "Reason for Request")]
        with patch("app.core.seeds.role_requests.settings") as mock_settings:
            mock_settings.ROLE_REQUEST_INFO_OPTIONS = options
            await init_role_request_options(db_session)

        # Run again with same data
        with patch("app.core.seeds.role_requests.settings") as mock_settings:
            mock_settings.ROLE_REQUEST_INFO_OPTIONS = options
            await init_role_request_options(db_session)

        result = await db_session.execute(select(RoleRequestInfoOption))
        rows = result.scalars().all()
        assert len(rows) == 1
        assert rows[0].display_name == "Reason for Request"

    async def test_idempotent_does_not_duplicate(self, db_session):
        options = [_make_option("plans", "Future Plans")]
        with patch("app.core.seeds.role_requests.settings") as mock_settings:
            mock_settings.ROLE_REQUEST_INFO_OPTIONS = options
            await init_role_request_options(db_session)
            await init_role_request_options(db_session)

        result = await db_session.execute(select(RoleRequestInfoOption))
        rows = result.scalars().all()
        assert len(rows) == 1

    async def test_empty_options_list(self, db_session):
        with patch("app.core.seeds.role_requests.settings") as mock_settings:
            mock_settings.ROLE_REQUEST_INFO_OPTIONS = []
            await init_role_request_options(db_session)

        result = await db_session.execute(select(RoleRequestInfoOption))
        rows = result.scalars().all()
        assert rows == []

    async def test_multiple_options_all_inserted(self, db_session):
        options = [
            _make_option("fullName", "Full Name"),
            _make_option("contact", "Contact Information"),
            _make_option("age", "Age"),
            _make_option("experience", "Experience"),
        ]
        with patch("app.core.seeds.role_requests.settings") as mock_settings:
            mock_settings.ROLE_REQUEST_INFO_OPTIONS = options
            await init_role_request_options(db_session)

        result = await db_session.execute(select(RoleRequestInfoOption))
        rows = result.scalars().all()
        assert len(rows) == 4

    async def test_inserted_option_has_correct_display_name(self, db_session):
        options = [_make_option("experience", "Experience Level")]
        with patch("app.core.seeds.role_requests.settings") as mock_settings:
            mock_settings.ROLE_REQUEST_INFO_OPTIONS = options
            await init_role_request_options(db_session)

        result = await db_session.execute(
            select(RoleRequestInfoOption).where(RoleRequestInfoOption.name == "experience")
        )
        opt = result.scalar_one_or_none()
        assert opt is not None
        assert opt.display_name == "Experience Level"

    async def test_uses_real_settings_options(self, db_session):
        """Integration: verifies real role_request_options from settings are seeded."""
        await init_role_request_options(db_session)

        result = await db_session.execute(select(RoleRequestInfoOption))
        rows = result.scalars().all()
        names = [r.name for r in rows]
        assert "fullName" in names
        assert "contact" in names
        assert "age" in names

    async def test_partial_update_only_changed_options_updated(self, db_session):
        """Only options with changed display_name should be updated; others stay the same."""
        options = [
            _make_option("reason", "Reason"),
            _make_option("plans", "Plans"),
        ]
        with patch("app.core.seeds.role_requests.settings") as mock_settings:
            mock_settings.ROLE_REQUEST_INFO_OPTIONS = options
            await init_role_request_options(db_session)

        # Only update one
        updated_options = [
            _make_option("reason", "Updated Reason"),
            _make_option("plans", "Plans"),  # unchanged
        ]
        with patch("app.core.seeds.role_requests.settings") as mock_settings:
            mock_settings.ROLE_REQUEST_INFO_OPTIONS = updated_options
            await init_role_request_options(db_session)

        reason_result = await db_session.execute(
            select(RoleRequestInfoOption).where(RoleRequestInfoOption.name == "reason")
        )
        plans_result = await db_session.execute(
            select(RoleRequestInfoOption).where(RoleRequestInfoOption.name == "plans")
        )
        reason_opt = reason_result.scalar_one_or_none()
        plans_opt = plans_result.scalar_one_or_none()
        assert reason_opt.display_name == "Updated Reason"
        assert plans_opt.display_name == "Plans"


# ---------------------------------------------------------------------------
# init_static_data() tests
# ---------------------------------------------------------------------------

class TestInitStaticData:
    async def test_calls_all_seed_functions(self, db_session):
        """Verify all 5 seed functions are called by checking their effects on DB."""
        await init_static_data(db_session)

        # Roles should be seeded
        role_result = await db_session.execute(select(Role))
        roles = role_result.scalars().all()
        assert len(roles) > 0

        # Tournament statuses should be seeded
        t_status_result = await db_session.execute(select(TournamentStatusOption))
        t_statuses = t_status_result.scalars().all()
        assert len(t_statuses) > 0

        # Task statuses should be seeded
        task_status_result = await db_session.execute(select(TaskStatusOption))
        task_statuses = task_status_result.scalars().all()
        assert len(task_statuses) > 0

        # Categories should be seeded
        cat_result = await db_session.execute(select(TaskRequirementCategory))
        cats = cat_result.scalars().all()
        assert len(cats) > 0

        # Role request options should be seeded
        rr_result = await db_session.execute(select(RoleRequestInfoOption))
        rr_opts = rr_result.scalars().all()
        assert len(rr_opts) > 0

    async def test_is_idempotent(self, db_session):
        """Running twice should not create duplicate records."""
        await init_static_data(db_session)

        role_result1 = await db_session.execute(select(Role))
        count_after_first = len(role_result1.scalars().all())

        await init_static_data(db_session)

        role_result2 = await db_session.execute(select(Role))
        count_after_second = len(role_result2.scalars().all())

        assert count_after_first == count_after_second

    async def test_seeds_admin_role(self, db_session):
        await init_static_data(db_session)

        result = await db_session.execute(
            select(Role).where(Role.name == "admin")
        )
        admin_role = result.scalar_one_or_none()
        assert admin_role is not None
        assert admin_role.display_name == "Admin"

    async def test_seeds_tournament_statuses_with_correct_names(self, db_session):
        await init_static_data(db_session)

        result = await db_session.execute(select(TournamentStatusOption))
        names = [r.name for r in result.scalars().all()]
        assert "draft" in names
        assert "registration" in names
        assert "running" in names
        assert "finished" in names

    async def test_seeds_task_statuses_with_correct_names(self, db_session):
        await init_static_data(db_session)

        result = await db_session.execute(select(TaskStatusOption))
        names = [r.name for r in result.scalars().all()]
        assert "draft" in names
        assert "active" in names

    async def test_seeds_role_request_options(self, db_session):
        await init_static_data(db_session)

        result = await db_session.execute(select(RoleRequestInfoOption))
        names = [r.name for r in result.scalars().all()]
        assert "fullName" in names
        assert "contact" in names

    async def test_seeds_parent_and_child_categories(self, db_session):
        await init_static_data(db_session)

        result = await db_session.execute(select(TaskRequirementCategory))
        rows = result.scalars().all()
        parents = [r for r in rows if r.main_id is None]
        children = [r for r in rows if r.main_id is not None]
        assert len(parents) > 0
        assert len(children) > 0
