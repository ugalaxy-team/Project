import pytest
from tests.factories import (
    TaskFactory,
    TaskStatusOptionFactory,
    TeamFactory,
    TeamMemberFactory,
    TournamentFactory,
    TournamentStatusOptionFactory,
    UserFactory,
    JuryAssignmentFactory,
    SubmissionFactory,
    SubmissionEvaluationFactory,
    TaskEvaluationCriterionFactory,
    CriterionScoreFactory
)
from app.config import settings
from app.utils import calculate_evaluation_total, calculate_evaluation_average

@pytest.mark.slow
async def test_task_leaderboard(create, client, db_session):
    j1 = await create(UserFactory)
    j2 = await create(UserFactory)
    finished = await create(TournamentStatusOptionFactory, name=settings.TOURNAMENT_STATUS_NAMES.FINISHED)
    tournament = await create(TournamentFactory, status=finished)
    closed = await create(TaskStatusOptionFactory, name=settings.TASK_STATUS_NAMES.SUBMISSION_CLOSED)
    task = await create(TaskFactory, tournament=tournament, status=closed, min_reviews_per_submission=0)
    captain = await create(TeamMemberFactory, tournament=tournament)
    team = await create(TeamFactory, captain=captain, tournament=tournament)
    s1 = await create(SubmissionFactory, task=task, team=team)
    a1 = await create(JuryAssignmentFactory, task=task, submission=s1, jury=j1)
    a2 = await create(JuryAssignmentFactory, task=task, submission=s1, jury=j2)
    e1 = await create(SubmissionEvaluationFactory, jury=j1, assignment=a1, submission=s1)
    e2 = await create(SubmissionEvaluationFactory, jury=j2, assignment=a2, submission=s1)
    await db_session.refresh(e1, ['criterion_scores'])
    await db_session.refresh(e2, ['criterion_scores'])
    c1 = await create(TaskEvaluationCriterionFactory, task=task)
    c2 = await create(TaskEvaluationCriterionFactory, task=task)
    await create(CriterionScoreFactory, score=7, evaluation=e1, criterion=c1)
    await create(CriterionScoreFactory, score=52, evaluation=e2, criterion=c2)
    totals = [calculate_evaluation_total(e1), calculate_evaluation_total(e2)]
    total_calculated = sum(totals)
    avg_calculated = calculate_evaluation_average(totals)


    resp = await client.get(f'/tournaments/{tournament.id}/tasks/{task.id}/leaderboard/')
    assert resp.status_code == 200
    total_scores = [e['total_score'] for e in resp.json()]
    average_scores = [e['average_score'] for e in resp.json()]
    assert total_calculated in total_scores
    assert avg_calculated in average_scores
