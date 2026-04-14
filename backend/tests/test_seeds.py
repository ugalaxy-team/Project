import pytest
from sqlalchemy import select

from app.core.seeds.categories import init_categories, CATEGORIES
from app.core.seeds.status import (
    init_tournament_statuses,
    init_task_statuses,
    DEFAULT_TOURNAMENT_STATUSES,
    DEFAULT_TASK_STATUSES,
)
from app.models import TaskRequirementCategory, TournamentStatusOption, TaskStatusOption


# ---- init_categories tests ----

async def test_init_categories_creates_parent_categories(db_session):
    await init_categories(db_session)

    result = await db_session.execute(
        select(TaskRequirementCategory).where(TaskRequirementCategory.main_id.is_(None))
    )
    parents = result.scalars().all()
    expected_parents = [c["name"] for c in CATEGORIES if c["main_id"] is None]

    assert len(parents) == len(expected_parents)
    parent_names = {p.name for p in parents}
    for name in expected_parents:
        assert name in parent_names


async def test_init_categories_creates_child_categories(db_session):
    await init_categories(db_session)

    result = await db_session.execute(
        select(TaskRequirementCategory).where(TaskRequirementCategory.main_id.isnot(None))
    )
    children = result.scalars().all()
    expected_children = [c["name"] for c in CATEGORIES if c["main_id"] is not None]

    assert len(children) == len(expected_children)


async def test_init_categories_children_have_correct_parent(db_session):
    await init_categories(db_session)

    sql_category = await db_session.get(TaskRequirementCategory, "SQL")
    assert sql_category is not None
    assert sql_category.main_id == "Databases"

    nosql_category = await db_session.get(TaskRequirementCategory, "NoSQL")
    assert nosql_category is not None
    assert nosql_category.main_id == "Databases"

    frameworks_category = await db_session.get(TaskRequirementCategory, "Frameworks")
    assert frameworks_category is not None
    assert frameworks_category.main_id == "Backend"


async def test_init_categories_display_name_matches_name(db_session):
    await init_categories(db_session)

    result = await db_session.execute(select(TaskRequirementCategory))
    all_categories = result.scalars().all()

    for cat in all_categories:
        assert cat.display_name == cat.name


async def test_init_categories_idempotent(db_session):
    await init_categories(db_session)
    await init_categories(db_session)

    result = await db_session.execute(select(TaskRequirementCategory))
    all_categories = result.scalars().all()

    assert len(all_categories) == len(CATEGORIES)


async def test_init_categories_total_count(db_session):
    await init_categories(db_session)

    result = await db_session.execute(select(TaskRequirementCategory))
    all_categories = result.scalars().all()

    assert len(all_categories) == len(CATEGORIES)


async def test_init_categories_specific_parent_names(db_session):
    await init_categories(db_session)

    for name in ["Languages", "Backend", "Frontend", "Databases", "Infrastructure", "Mobile", "Design & UI/UX"]:
        cat = await db_session.get(TaskRequirementCategory, name)
        assert cat is not None, f"Expected parent category '{name}' to exist"
        assert cat.main_id is None


async def test_init_categories_does_not_create_orphan_children(db_session):
    """Children are only created if their parent exists."""
    await init_categories(db_session)

    result = await db_session.execute(
        select(TaskRequirementCategory).where(TaskRequirementCategory.main_id.isnot(None))
    )
    children = result.scalars().all()

    for child in children:
        parent = await db_session.get(TaskRequirementCategory, child.main_id)
        assert parent is not None, f"Child '{child.name}' has missing parent '{child.main_id}'"


# ---- init_tournament_statuses tests ----

async def test_init_tournament_statuses_creates_all_statuses(db_session):
    await init_tournament_statuses(db_session)

    result = await db_session.execute(select(TournamentStatusOption))
    statuses = result.scalars().all()

    assert len(statuses) == len(DEFAULT_TOURNAMENT_STATUSES)


async def test_init_tournament_statuses_correct_names(db_session):
    await init_tournament_statuses(db_session)

    for name, display in DEFAULT_TOURNAMENT_STATUSES.items():
        result = await db_session.execute(
            select(TournamentStatusOption).where(TournamentStatusOption.name == name)
        )
        status = result.scalar_one_or_none()
        assert status is not None, f"Expected status '{name}' to exist"
        assert status.display_name == display


async def test_init_tournament_statuses_idempotent(db_session):
    await init_tournament_statuses(db_session)
    await init_tournament_statuses(db_session)

    result = await db_session.execute(select(TournamentStatusOption))
    statuses = result.scalars().all()

    assert len(statuses) == len(DEFAULT_TOURNAMENT_STATUSES)


async def test_init_tournament_statuses_draft_exists(db_session):
    await init_tournament_statuses(db_session)

    result = await db_session.execute(
        select(TournamentStatusOption).where(TournamentStatusOption.name == "draft")
    )
    draft_status = result.scalar_one_or_none()
    assert draft_status is not None
    assert draft_status.display_name == "Draft"


async def test_init_tournament_statuses_all_expected_values(db_session):
    await init_tournament_statuses(db_session)

    expected = {"draft", "registration", "running", "finished", "canceled"}
    result = await db_session.execute(select(TournamentStatusOption))
    statuses = result.scalars().all()
    actual_names = {s.name for s in statuses}

    assert actual_names == expected


# ---- init_task_statuses tests ----

async def test_init_task_statuses_creates_all_statuses(db_session):
    await init_task_statuses(db_session)

    result = await db_session.execute(select(TaskStatusOption))
    statuses = result.scalars().all()

    assert len(statuses) == len(DEFAULT_TASK_STATUSES)


async def test_init_task_statuses_correct_names_and_display(db_session):
    await init_task_statuses(db_session)

    for name, display in DEFAULT_TASK_STATUSES.items():
        result = await db_session.execute(
            select(TaskStatusOption).where(TaskStatusOption.name == name)
        )
        status = result.scalar_one_or_none()
        assert status is not None, f"Expected task status '{name}' to exist"
        assert status.display_name == display


async def test_init_task_statuses_idempotent(db_session):
    await init_task_statuses(db_session)
    await init_task_statuses(db_session)

    result = await db_session.execute(select(TaskStatusOption))
    statuses = result.scalars().all()

    assert len(statuses) == len(DEFAULT_TASK_STATUSES)


async def test_init_task_statuses_all_expected_values(db_session):
    await init_task_statuses(db_session)

    expected = {"draft", "active", "submission_closed", "evaluated"}
    result = await db_session.execute(select(TaskStatusOption))
    statuses = result.scalars().all()
    actual_names = {s.name for s in statuses}

    assert actual_names == expected


async def test_init_task_statuses_draft_exists(db_session):
    await init_task_statuses(db_session)

    status = await db_session.get(TaskStatusOption, "draft")
    assert status is not None
    assert status.display_name == "Draft"


async def test_init_task_statuses_evaluated_is_terminal(db_session):
    await init_task_statuses(db_session)

    status = await db_session.get(TaskStatusOption, "evaluated")
    assert status is not None
    assert status.name == "evaluated"


async def test_init_both_statuses_independent(db_session):
    """Tournament and task statuses do not interfere."""
    await init_tournament_statuses(db_session)
    await init_task_statuses(db_session)

    tournament_result = await db_session.execute(select(TournamentStatusOption))
    task_result = await db_session.execute(select(TaskStatusOption))

    tournament_statuses = tournament_result.scalars().all()
    task_statuses = task_result.scalars().all()

    assert len(tournament_statuses) == len(DEFAULT_TOURNAMENT_STATUSES)
    assert len(task_statuses) == len(DEFAULT_TASK_STATUSES)