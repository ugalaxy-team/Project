import pytest
import asyncio
from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
from app.config import settings
from app.models import (
    User,
    Role,
    NewsCattegory,
    News,
    TeamMember,
    Team,
    Task,
    Tournament,
    TournamentStatusOption,
    TaskRequirementCategory,
    Submission,
    SubmissionUrl,
    SubmissionUrlOption,
    SubmissionEvaluation,
    CriterionScore,
    Notification,
    RoleRequest,
)

from .factories import (
    UserFactory,
    RoleFactory,
    NewsFactory,
    NewsCattegoryFactory,
    TournamentStatusOptionFactory,
    TournamentFactory,
    TeamFactory,
    TeamMemberFactory,
    TaskStatusOptionFactory,
    TaskFactory,
    TaskRequirementCategoryFactory,
    TaskRequirementOptionFactory,
    SubmissionFactory,
    SubmissionUrlFactory,
    SubmissionUrlOptionFactory,
    TaskEvaluationCriterionFactory,
    SubmissionEvaluationFactory,
    CriterionScoreFactory,
    NotificationFactory,
    RoleRequestFactory,
)


# USER TESTS
async def test_create_user(create):
    user = await create(UserFactory)
    assert user.id is not None
    assert user.full_name is not None
    assert user.email is not None
    assert user.created_at is not None


async def test_create_user_duplicate_email(db_session, create):
    user1 = await create(UserFactory)

    duplicate_user = UserFactory.build(email=user1.email)
    db_session.add(duplicate_user)

    with pytest.raises(IntegrityError):
        await db_session.flush()

    await db_session.rollback()


# ROLE TESTS
async def test_create_role(create):
    role = await create(RoleFactory, name=settings.ROLE_NAMES.ORGANIZER)
    assert role.name is not None
    assert role.name == settings.ROLE_NAMES.ORGANIZER


async def test_role_name_unique_constraint(create):
    await create(RoleFactory, name=settings.ROLE_NAMES.ORGANIZER)

    with pytest.raises(IntegrityError):
        await create(RoleFactory, name=settings.ROLE_NAMES.ORGANIZER)


async def test_user_roles_relationship(db_session, create):
    user = await create(UserFactory)
    role_organizer = await create(RoleFactory, name=settings.ROLE_NAMES.ORGANIZER)
    role_admin = await create(RoleFactory, name="admin")

    stmt = select(User).where(User.id == user.id).options(selectinload(User.roles))
    result = await db_session.execute(stmt)
    user = result.unique().scalar_one()

    user.roles.extend([role_organizer, role_admin])
    await db_session.commit()

    stmt_check = select(User).where(User.id == user.id).options(selectinload(User.roles))
    result_check = await db_session.execute(stmt_check)
    db_user = result_check.unique().scalar_one()

    assert len(db_user.roles) == 2
    assert "admin" in [r.name for r in db_user.roles]


async def test_user_participates_in_relationship(db_session, create):
    user = await create(UserFactory)
    tournament1 = await create(TournamentFactory)
    tournament2 = await create(TournamentFactory)
    other_tournament = await create(TournamentFactory)

    team1 = await create(TeamFactory, tournament=tournament1)
    team2 = await create(TeamFactory, tournament=tournament2)
    other_team = await create(TeamFactory, tournament=other_tournament)

    await create(TeamMemberFactory, team=team1, tournament=tournament1, email=user.email)
    await create(TeamMemberFactory, team=team2, tournament=tournament2, email=user.email)
    await create(TeamMemberFactory, team=other_team, tournament=other_tournament)

    stmt = select(User).where(User.id == user.id).options(selectinload(User.participates_in))
    result = await db_session.execute(stmt)
    db_user = result.unique().scalar_one()

    assert {tournament.id for tournament in db_user.participates_in} == {
        tournament1.id,
        tournament2.id,
    }


# TEAM/TEAM MEMBER TESTS
async def test_create_team_member(create):
    member = await create(TeamMemberFactory)

    assert member.id is not None
    assert member.team_id == member.team.id


async def test_team_member_duplicate_email_same_team(create, db_session):
    team = await create(TeamFactory)
    member1 = await create(TeamMemberFactory, team=team)

    duplicate = TeamMemberFactory.build(email=member1.email, team=team)
    db_session.add(duplicate)

    with pytest.raises(IntegrityError):
        await db_session.flush()

    await db_session.rollback()


async def test_team_member_duplicate_email_different_tournaments(create, db_session):
    team1 = await create(TeamFactory)
    team2 = await create(TeamFactory)
    member1 = await create(TeamMemberFactory, tournament=team1.tournament)
    member2 = await create(TeamMemberFactory, email=member1.email, tournament=team2.tournament)

    await db_session.commit()
    assert member1.email == member2.email


async def test_team_member_duplicate_email_same_tournament(create, db_session):
    team1 = await create(TeamFactory)
    team2 = await create(TeamFactory, tournament=team1.tournament)
    member1 = await create(TeamMemberFactory, tournament=team1.tournament)
    with pytest.raises(IntegrityError):
        await create(TeamMemberFactory, email=member1.email, tournament=team2.tournament)
        await db_session.flush()

    await db_session.rollback()


async def test_create_team(create):
    team = await create(TeamFactory)
    assert team.id is not None
    assert team.name is not None
    assert team.team_email is not None


async def test_team_duplicate_email(db_session, create):
    email = "duplicate@example.com"
    await create(TeamFactory, team_email=email)

    with pytest.raises(IntegrityError):
        await create(TeamFactory, team_email=email)

    await db_session.rollback()


async def test_set_team_captain(db_session, create):
    team = await create(TeamFactory)
    member = await create(TeamMemberFactory, team=team)
    team.captain_id = member.id
    db_session.add(team)
    await db_session.commit()
    await db_session.refresh(team)

    assert team.captain_id == member.id


async def test_team_team_member_relationship(db_session, create):
    team = await create(TeamFactory)
    member = await create(TeamMemberFactory, team=team)

    stmt = select(Team).where(Team.id == team.id).options(selectinload(Team.members))
    result = await db_session.execute(stmt)
    db_team = result.unique().scalar_one()

    assert len(db_team.members) == 1
    assert db_team.members[0].id == member.id


async def test_team_cascade_delete_members(db_session, create):
    team = await create(TeamFactory)
    member = await create(TeamMemberFactory, team=team)
    member_id = member.id

    await db_session.delete(team)
    await db_session.commit()

    stmt = select(TeamMember).where(TeamMember.id == member_id)
    result = await db_session.execute(stmt)
    assert result.scalar_one_or_none() is None


async def test_tournament_cascade_delete_children(db_session, create):
    tournament = await create(TournamentFactory)
    task = await create(TaskFactory, tournament=tournament)
    team = await create(TeamFactory, tournament=tournament)
    member = await create(TeamMemberFactory, team=team, tournament=tournament)
    submission = await create(SubmissionFactory, team=team)
    url = await create(SubmissionUrlFactory, submission=submission)
    evaluation = await create(SubmissionEvaluationFactory, submission=submission)
    criterion_score = await create(CriterionScoreFactory, evaluation=evaluation)

    ids = {
        "task": task.id,
        "team": team.id,
        "member": member.id,
        "submission": submission.team_id,
        "url": (url.submission_id, url.url_id),
        "evaluation": evaluation.id,
        "criterion_score": criterion_score.id,
    }

    await db_session.delete(tournament)
    await db_session.commit()

    assert await db_session.get(Task, ids["task"]) is None
    assert await db_session.get(Team, ids["team"]) is None
    assert await db_session.get(TeamMember, ids["member"]) is None
    assert await db_session.get(Submission, ids["submission"]) is None
    assert await db_session.get(SubmissionUrl, ids["url"]) is None
    assert await db_session.get(SubmissionEvaluation, ids["evaluation"]) is None
    assert await db_session.get(CriterionScore, ids["criterion_score"]) is None


# TASK TESTS
async def test_create_task(create):
    task = await create(TaskFactory)

    assert task.id is not None
    assert task.title is not None
    assert task.tournament_id is not None
    assert task.status_id in [option["name"] for option in settings.TASK_STATUS_OPTIONS]


async def test_task_requirements_relationship(db_session, create):
    category = await create(TaskRequirementCategoryFactory)
    option = await create(TaskRequirementOptionFactory, category=category)
    task = await create(TaskFactory, requirements=[option])

    stmt = select(Task).where(Task.id == task.id).options(selectinload(Task.requirements))

    result = await db_session.execute(stmt)
    db_task = result.unique().scalar_one()

    assert len(db_task.requirements) == 1
    assert db_task.requirements[0].name == option.name


async def test_task_invalid_time(create):
    task = await create(
        TaskFactory,
        start_time=datetime.now(),
        end_time=datetime.now() - timedelta(hours=1),
    )

    assert task.end_time < task.start_time


async def test_task_category_hierarchy(db_session, create):
    parent = await create(TaskRequirementCategoryFactory)
    child = await create(TaskRequirementCategoryFactory, main_id=parent.name)

    stmt = (
        select(TaskRequirementCategory)
        .where(TaskRequirementCategory.name == parent.name)
        .options(selectinload(TaskRequirementCategory.sub_categories))
    )

    result = await db_session.execute(stmt)
    db_parent = result.unique().scalar_one()

    assert len(db_parent.sub_categories) == 1
    assert db_parent.sub_categories[0].name == child.name
    assert db_parent.sub_categories[0].parent_category.name == parent.name


async def test_create_task_status_option(create):
    status = await create(TaskStatusOptionFactory)

    assert status.name in [option["name"] for option in settings.TASK_STATUS_OPTIONS]
    assert status.display_name in [
        option["display_name"] for option in settings.TASK_STATUS_OPTIONS
    ]


async def test_task_status_relationship(db_session, create):
    status = await create(TaskStatusOptionFactory)
    task = await create(TaskFactory, status=status)

    stmt = select(Task).where(Task.id == task.id).options(selectinload(Task.status))

    result = await db_session.execute(stmt)
    db_task = result.scalar_one()

    assert db_task.status.name == status.name


# TOURNAMENT TESTS
async def test_create_tournament(create):
    tournament = await create(TournamentFactory)

    assert tournament.title is not None
    assert tournament.description is not None
    assert tournament.max_teams is not None


async def test_tournament_end_time(create, db_session):
    tournament1 = await create(TournamentFactory)
    tournament2 = await create(TournamentFactory)
    t1 = await create(
        TaskFactory,
        tournament=tournament1,
        end_time=datetime.now() + timedelta(hours=12),
    )
    t2 = await create(
        TaskFactory, tournament=tournament1, end_time=datetime.now() + timedelta(days=1)
    )
    t3 = await create(
        TaskFactory,
        tournament=tournament1,
        end_time=datetime.now() + timedelta(weeks=1),
    )
    assert tournament1.end_date == t3.end_time
    assert not tournament2.end_date

    t2.tournament_id = tournament2.id
    t1.tournament_id = tournament2.id
    await db_session.commit()

    await db_session.refresh(tournament2)
    assert tournament2.end_date == t2.end_time


async def test_tournament_active_task(create, db_session):
    tournament = await create(TournamentFactory)
    active = await create(TaskStatusOptionFactory, name=settings.TASK_STATUS_NAMES.ACTIVE)
    submission_closed = await create(
        TaskStatusOptionFactory, name=settings.TASK_STATUS_NAMES.SUBMISSION_CLOSED
    )
    draft = await create(TaskStatusOptionFactory, name=settings.TASK_STATUS_NAMES.DRAFT)
    t1 = await create(TaskFactory, tournament=tournament, status=active)
    await create(TaskFactory, tournament=tournament, status_id=submission_closed)
    await create(TaskFactory, tournament=tournament, status_id=draft)
    assert tournament.active_task.id == t1.id


async def test_tournament_invalid_time(create):
    tournament = await create(
        TournamentFactory,
        reg_start=datetime.now() + timedelta(days=1),
        reg_end=datetime.now() - timedelta(hours=1),
    )

    assert tournament.reg_end < tournament.reg_start


async def test_tournament_without_creator(db_session, create):
    with pytest.raises(IntegrityError):
        await create(TournamentFactory, creator=None)

    await db_session.rollback()


async def test_tournament_creator_relationship(db_session, create):
    tournament = await create(TournamentFactory)

    stmt = (
        select(Tournament)
        .where(Tournament.id == tournament.id)
        .options(selectinload(Tournament.creator))
    )

    result = await db_session.execute(stmt)
    db_tournament = result.scalar_one()

    assert db_tournament.creator is not None
    assert db_tournament.creator.id == tournament.creator.id


async def test_tournament_status_relationship(db_session, create):
    tournament = await create(TournamentFactory)

    stmt = (
        select(Tournament)
        .where(Tournament.id == tournament.id)
        .options(selectinload(Tournament.status))
    )

    result = await db_session.execute(stmt)
    db_tournament = result.scalar_one()

    assert db_tournament.status is not None


async def test_tournament_tasks_relationship(db_session, create):
    tournament = await create(TournamentFactory)

    await create(TaskFactory, tournament=tournament)
    await create(TaskFactory, tournament=tournament)

    stmt = (
        select(Tournament)
        .where(Tournament.id == tournament.id)
        .options(selectinload(Tournament.tasks))
    )

    result = await db_session.execute(stmt)
    db_tournament = result.scalar_one()

    assert len(db_tournament.tasks) == 2


async def test_create_tournament_status_option(db_session, create):
    tournament_status_option = await create(TournamentStatusOptionFactory)

    stmt = select(TournamentStatusOption).where(
        TournamentStatusOption.name == tournament_status_option.name
    )

    result = await db_session.execute(stmt)
    db_tournament_status_option = result.scalar_one()

    assert db_tournament_status_option.name == tournament_status_option.name


async def test_tournament_status_option_unique_name(db_session, create):
    await create(TournamentStatusOptionFactory, name="Ongoing")

    with pytest.raises(IntegrityError):
        await create(TournamentStatusOptionFactory, name="Ongoing")

    await db_session.rollback()


# SUBMISSION TESTS
async def test_create_submission(create):
    submission = await create(SubmissionFactory)

    assert submission.team_id is not None
    assert submission.team is not None


async def test_submission_urls_relationship(db_session, create):
    submission = await create(SubmissionFactory)
    await create(SubmissionUrlFactory, submission=submission)
    await create(SubmissionUrlFactory, submission=submission)

    stmt = (
        select(Submission)
        .where(Submission.team_id == submission.team_id)
        .options(selectinload(Submission.urls))
    )

    result = await db_session.execute(stmt)
    db_submission = result.scalar_one()

    assert len(db_submission.urls) == 2


async def test_multiple_submissions(create):
    submissions1 = await create(SubmissionFactory)
    submissions2 = await create(SubmissionFactory)

    assert submissions1.team_id is not None
    assert submissions2.team_id is not None
    assert submissions1.team_id != submissions2.team_id


async def test_submission_urls_belong_to_submission(create):
    submission = await create(SubmissionFactory)

    url1 = await create(SubmissionUrlFactory, submission=submission)
    url2 = await create(SubmissionUrlFactory, submission=submission)

    assert url1.submission_id == submission.team_id
    assert url2.submission_id == submission.team_id


async def test_submission_url_has_submission(db_session, create):
    url = await create(SubmissionUrlFactory)

    stmt = (
        select(SubmissionUrl)
        .where(SubmissionUrl.submission_id == url.submission_id)
        .options(selectinload(SubmissionUrl.submission))
    )

    result = await db_session.execute(stmt)
    db_url = result.scalar_one()

    assert db_url.submission is not None


async def test_submission_url_option_values(create):
    option = await create(SubmissionUrlOptionFactory)

    assert option.name.startswith("url_option_")
    assert option.display_name == option.name.upper()


# EVALUATION TESTS
async def test_create_submission_evaluation(create):
    evaluation = await create(SubmissionEvaluationFactory)

    assert evaluation.id is not None
    assert evaluation.submission is not None
    assert evaluation.jury is not None


async def test_create_criterion_score(create):
    evaluation = await create(CriterionScoreFactory)

    assert evaluation.evaluation_id is not None
    assert evaluation.evaluation is not None
    assert 0 <= evaluation.score <= 100


async def test_evaluation_multiple_requirements(create):
    evaluation = await create(SubmissionEvaluationFactory)

    req1 = await create(CriterionScoreFactory, evaluation=evaluation)
    req2 = await create(CriterionScoreFactory, evaluation=evaluation)

    assert req1.evaluation_id == evaluation.id
    assert req2.evaluation_id == evaluation.id


async def test_submission_evaluations_relationship(db_session, create):
    submission = await create(SubmissionFactory)

    await create(SubmissionEvaluationFactory, submission=submission)
    await create(SubmissionEvaluationFactory, submission=submission)

    stmt = (
        select(Submission)
        .where(Submission.team_id == submission.team_id)
        .options(selectinload(Submission.evaluations))
    )

    result = await db_session.execute(stmt)
    db_submission = result.scalar_one()

    assert len(db_submission.evaluations) == 2


async def test_judge_cannot_evaluate_twice(create):
    evaluation = await create(SubmissionEvaluationFactory)

    with pytest.raises(IntegrityError):
        await create(
            SubmissionEvaluationFactory,
            submission=evaluation.submission,
            jury=evaluation.jury,
        )


async def test_evaluation_jury_relationship(db_session, create):
    evaluation = await create(SubmissionEvaluationFactory)

    stmt = (
        select(SubmissionEvaluation)
        .where(SubmissionEvaluation.id == evaluation.id)
        .options(selectinload(SubmissionEvaluation.jury))
    )

    result = await db_session.execute(stmt)
    db_eval = result.scalar_one()

    assert db_eval.jury.id == evaluation.jury.id


async def test_criterion_score_option_relationship(db_session, create):
    option = await create(TaskEvaluationCriterionFactory)

    req_eval = await create(
        CriterionScoreFactory,
        criterion=option,
    )

    stmt = (
        select(CriterionScore)
        .where(CriterionScore.id == req_eval.id)
        .options(selectinload(CriterionScore.criterion))
    )

    result = await db_session.execute(stmt)
    db_req_eval = result.scalar_one()

    assert db_req_eval.criterion.name == option.name


# NOTIFICATION TESTS
async def test_create_notification(create):
    notification = await create(NotificationFactory)

    assert notification.body is not None
    assert notification.user is not None


async def test_user_notifications_relationship(db_session, create):
    user = await create(UserFactory)
    await create(NotificationFactory, user=user)
    await create(NotificationFactory, user=user)

    stmt = select(User).where(User.id == user.id).options(selectinload(User.notifications))
    result = await db_session.execute(stmt)
    db_user = result.scalar_one()

    assert len(db_user.notifications) == 2


async def test_notification_user_relationship(db_session, create):
    notification = await create(NotificationFactory)

    stmt = (
        select(Notification)
        .where(Notification.id == notification.id)
        .options(selectinload(Notification.user))
    )

    result = await db_session.execute(stmt)
    db_notification = result.scalar_one()

    assert db_notification.user.id == notification.user.id


# ROLE REQUEST TESTS
async def test_create_role_request(create):
    role_request = await create(RoleRequestFactory)

    assert role_request.role is not None
    assert role_request.user is not None


async def test_user_role_requests_relationship(db_session, create):
    user = await create(UserFactory)
    await create(RoleRequestFactory, user=user)
    await create(RoleRequestFactory, user=user)

    stmt = select(User).where(User.id == user.id).options(selectinload(User.role_requests))
    result = await db_session.execute(stmt)
    db_user = result.scalar_one()

    assert len(db_user.role_requests) == 2


async def test_role_requests_relationship(db_session, create):
    role = await create(RoleFactory)
    await create(RoleRequestFactory, role=role)
    await create(RoleRequestFactory, role=role)

    stmt = select(Role).where(role.name == role.name).options(selectinload(Role.requests))
    result = await db_session.execute(stmt)
    db_role = result.scalar_one()

    assert len(db_role.requests) == 2


# NEWS
async def test_create_news(create):
    news = await create(NewsFactory)

    assert news.id is not None
    assert news.body


async def test_create_news_important(db_session, create):
    news = await create(NewsFactory, is_important=True)
    notification = (
        await db_session.execute(select(Notification).where(Notification.body == news.excerpt))
    ).scalar_one_or_none()
    assert notification
    assert notification.id
    assert notification.body
    assert not notification.user_id


async def test_create_news_category(create):
    category = await create(NewsCattegoryFactory)

    assert category.name in [option["name"] for option in settings.NEWS_CATEGORY_OPTIONS]
    assert category.display_name in [
        option["display_name"] for option in settings.NEWS_CATEGORY_OPTIONS
    ]
