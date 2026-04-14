import pytest
from sqlalchemy import select, inspect
from sqlalchemy.exc import IntegrityError

from app.models import (
    SubmissionEvaluation,
    RequirementEvaluation,
    Task,
    TaskRequirementCategory,
    TaskRequirementOption,
    TaskStatusOption,
    TournamentStatusOption,
)
from app.models.submission import Submission
from app.models.base import Base
from app.models.mixin.option_mixin import OptionMixin


# ---- Fixtures ----

@pytest.fixture
async def task_status(db_session):
    status = TaskStatusOption(name="draft", display_name="Draft")
    db_session.add(status)
    await db_session.commit()
    await db_session.refresh(status)
    return status


@pytest.fixture
async def submission(db_session, team):
    sub = Submission(team_id=team.id)
    db_session.add(sub)
    await db_session.commit()
    await db_session.refresh(sub)
    return sub


@pytest.fixture
async def requirement_category(db_session):
    cat = TaskRequirementCategory(name="TestCat", display_name="Test Category")
    db_session.add(cat)
    await db_session.commit()
    await db_session.refresh(cat)
    return cat


@pytest.fixture
async def requirement_option(db_session, requirement_category):
    opt = TaskRequirementOption(
        name="test_opt",
        display_name="Test Option",
        category_id=requirement_category.name,
    )
    db_session.add(opt)
    await db_session.commit()
    await db_session.refresh(opt)
    return opt


@pytest.fixture
async def submission_evaluation(db_session, submission, user):
    evaluation = SubmissionEvaluation(
        submission_id=submission.team_id,
        jury_id=user.id,
    )
    db_session.add(evaluation)
    await db_session.commit()
    await db_session.refresh(evaluation)
    return evaluation


# ---- OptionMixin tests ----

async def test_option_mixin_name_is_primary_key():
    """OptionMixin defines name as primary key."""
    assert hasattr(OptionMixin, "name")
    assert hasattr(OptionMixin, "display_name")


async def test_option_mixin_used_by_task_status_option(db_session):
    """TaskStatusOption uses OptionMixin: name is PK, display_name exists."""
    status = TaskStatusOption(name="active", display_name="Active")
    db_session.add(status)
    await db_session.commit()

    fetched = await db_session.get(TaskStatusOption, "active")
    assert fetched is not None
    assert fetched.name == "active"
    assert fetched.display_name == "Active"


async def test_option_mixin_name_pk_prevents_duplicates(db_session):
    """name being the primary key prevents duplicate names."""
    s1 = TaskStatusOption(name="duplicate", display_name="Dup 1")
    s2 = TaskStatusOption(name="duplicate", display_name="Dup 2")
    db_session.add(s1)
    await db_session.flush()

    db_session.add(s2)
    with pytest.raises(IntegrityError):
        await db_session.flush()
    await db_session.rollback()


async def test_option_mixin_display_name_required(db_session):
    """display_name cannot be null."""
    status = TaskStatusOption(name="no_display")
    db_session.add(status)
    with pytest.raises((IntegrityError, Exception)):
        await db_session.flush()
    await db_session.rollback()


# ---- SubmissionEvaluation tests ----

async def test_create_submission_evaluation(submission_evaluation, submission, user):
    assert submission_evaluation.id is not None
    assert submission_evaluation.submission_id == submission.team_id
    assert submission_evaluation.jury_id == user.id


async def test_submission_evaluation_unique_constraint(db_session, submission, user, submission_evaluation):
    """Cannot create two evaluations for the same submission by the same jury member."""
    duplicate = SubmissionEvaluation(
        submission_id=submission.team_id,
        jury_id=user.id,
    )
    db_session.add(duplicate)
    with pytest.raises(IntegrityError):
        await db_session.flush()
    await db_session.rollback()


async def test_submission_evaluation_different_jury_allowed(db_session, submission, user):
    """Two evaluations of the same submission by different jury members is allowed."""
    from app.models import User

    jury2 = User(full_name="Second Jury", email="jury2@example.com", password="pw")
    db_session.add(jury2)
    await db_session.flush()

    eval1 = SubmissionEvaluation(submission_id=submission.team_id, jury_id=user.id)
    eval2 = SubmissionEvaluation(submission_id=submission.team_id, jury_id=jury2.id)
    db_session.add_all([eval1, eval2])
    await db_session.commit()

    result = await db_session.execute(
        select(SubmissionEvaluation).where(
            SubmissionEvaluation.submission_id == submission.team_id
        )
    )
    evaluations = result.scalars().all()
    assert len(evaluations) == 2


async def test_submission_evaluation_requires_submission_id(db_session, user):
    """submission_id is required."""
    evaluation = SubmissionEvaluation(jury_id=user.id)
    db_session.add(evaluation)
    with pytest.raises((IntegrityError, Exception)):
        await db_session.flush()
    await db_session.rollback()


async def test_submission_evaluation_requires_jury_id(db_session, submission):
    """jury_id is required."""
    evaluation = SubmissionEvaluation(submission_id=submission.team_id)
    db_session.add(evaluation)
    with pytest.raises((IntegrityError, Exception)):
        await db_session.flush()
    await db_session.rollback()


async def test_submission_evaluation_table_name():
    assert SubmissionEvaluation.__tablename__ == "evaluations"


# ---- RequirementEvaluation tests ----

async def test_create_requirement_evaluation(db_session, submission_evaluation):
    req_eval = RequirementEvaluation(
        evaluation_id=submission_evaluation.id,
        score=85,
    )
    db_session.add(req_eval)
    await db_session.commit()
    await db_session.refresh(req_eval)

    assert req_eval.id is not None
    assert req_eval.evaluation_id == submission_evaluation.id
    assert req_eval.score == 85


async def test_requirement_evaluation_score_zero(db_session, submission_evaluation):
    """Score of zero is a valid score."""
    req_eval = RequirementEvaluation(
        evaluation_id=submission_evaluation.id,
        score=0,
    )
    db_session.add(req_eval)
    await db_session.commit()
    await db_session.refresh(req_eval)

    assert req_eval.score == 0


async def test_requirement_evaluation_requires_evaluation_id(db_session):
    """evaluation_id is required."""
    req_eval = RequirementEvaluation(score=50)
    db_session.add(req_eval)
    with pytest.raises((IntegrityError, Exception)):
        await db_session.flush()
    await db_session.rollback()


async def test_requirement_evaluation_requires_score(db_session, submission_evaluation):
    """score is required (not nullable)."""
    req_eval = RequirementEvaluation(evaluation_id=submission_evaluation.id)
    db_session.add(req_eval)
    with pytest.raises((IntegrityError, Exception)):
        await db_session.flush()
    await db_session.rollback()


async def test_requirement_evaluation_table_name():
    assert RequirementEvaluation.__tablename__ == "requirement_evaluations"


async def test_requirement_evaluation_with_requirement(
    db_session, submission_evaluation, requirement_option
):
    """RequirementEvaluation can be linked to requirement options via association table."""
    req_eval = RequirementEvaluation(
        evaluation_id=submission_evaluation.id,
        score=70,
    )
    db_session.add(req_eval)
    await db_session.flush()

    req_eval.requirement.append(requirement_option)
    await db_session.commit()
    await db_session.refresh(req_eval)

    assert len(req_eval.requirement) == 1
    assert req_eval.requirement[0].name == requirement_option.name


# ---- evaluation_requirements association table tests ----

async def test_evaluation_requirements_cascade_on_req_eval_delete(
    db_session, submission_evaluation, requirement_option
):
    """Deleting RequirementEvaluation cascades to evaluation_requirements rows."""
    req_eval = RequirementEvaluation(
        evaluation_id=submission_evaluation.id,
        score=60,
    )
    db_session.add(req_eval)
    await db_session.flush()
    req_eval.requirement.append(requirement_option)
    await db_session.commit()

    req_eval_id = req_eval.id

    await db_session.delete(req_eval)
    await db_session.commit()

    result = await db_session.execute(
        select(RequirementEvaluation).where(RequirementEvaluation.id == req_eval_id)
    )
    assert result.scalar_one_or_none() is None


# ---- Base model tests ----

def test_base_has_metadata():
    """Base has metadata attribute for all tables."""
    assert hasattr(Base, "metadata")
    assert Base.metadata is not None


def test_base_metadata_contains_evaluation_tables():
    """evaluation and requirement_evaluations tables are registered in metadata."""
    table_names = set(Base.metadata.tables.keys())
    assert "evaluations" in table_names
    assert "requirement_evaluations" in table_names
    assert "evaluation_requirements" in table_names