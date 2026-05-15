import pytest
from app import app
from app.dependencies import get_current_user
from app.models import TaskEvaluationCriterion
from tests.factories import (
    JuryAssignmentStatusOptionFactory,
    RoleFactory,
    SubmissionUrlOptionFactory,
    TaskFactory,
    TaskStatusOptionFactory,
    TeamFactory,
    TeamMemberFactory,
    TournamentFactory,
    TournamentStatusOptionFactory,
    UserFactory,
    JuryAssignmentFactory,
    JuryAssignmentStatusOptionFactory,
    SubmissionFactory,
    SubmissionEvaluationFactory,
    TaskEvaluationCriterionFactory,
    CriterionScoreFactory
)
from app.config import settings

async def test_jury_tasks(create, client, db_session):
    closed = await create(TaskStatusOptionFactory, name=settings.TASK_STATUS_NAMES.SUBMISSION_CLOSED)
    jury = await create(UserFactory)
    tournament = await create(TournamentFactory)
    t1 = await create(TaskFactory, status=closed, tournament=tournament)
    t2 = await create(TaskFactory, status=closed, tournament=tournament)
    captain1 = await create(TeamMemberFactory, tournament=tournament)
    captain2 = await create(TeamMemberFactory, tournament=tournament)
    team1 = await create(TeamFactory, tournament=tournament, captain=captain1)
    team2 = await create(TeamFactory, tournament=tournament, captain=captain2)
    s1 = await create(SubmissionFactory, task=t1, team=team1)
    s2 = await create(SubmissionFactory, task=t2, team=team2)
    await create(JuryAssignmentFactory, jury=jury, task=t1,
        submission=s1)
    await create(JuryAssignmentFactory, jury=jury, task=t2,
        submission=s2)
    app.dependency_overrides[get_current_user] = lambda: jury
    
    resp = await client.get('/jury/tasks/')
    assert resp.status_code == 200
    assert len(resp.json()) == 2
    t_ids = [t['id'] for t in resp.json()]
    assert t1.id in t_ids
    assert t2.id in t_ids
    
    app.dependency_overrides.pop(get_current_user)

async def test_jury_tasks_draft(create, client, db_session):
    draft = await create(TaskStatusOptionFactory, name=settings.TASK_STATUS_NAMES.DRAFT)
    jury = await create(UserFactory)
    tournament = await create(TournamentFactory)
    t = await create(TaskFactory, status=draft, tournament=tournament)
    captain = await create(TeamMemberFactory, tournament=tournament)
    team = await create(TeamFactory, tournament=tournament, captain=captain)
    s = await create(SubmissionFactory, task=t, team=team)
    await create(JuryAssignmentFactory, jury=jury, task=t,
        submission=s)
    app.dependency_overrides[get_current_user] = lambda: jury
    
    resp = await client.get('/jury/tasks/')
    assert resp.status_code == 200
    assert len(resp.json()) == 0 
    
    app.dependency_overrides.pop(get_current_user)

async def test_jury_assignments(create, client, db_session):
    closed = await create(TaskStatusOptionFactory, name=settings.TASK_STATUS_NAMES.SUBMISSION_CLOSED)
    jury = await create(UserFactory)
    tournament = await create(TournamentFactory)
    t1 = await create(TaskFactory, status=closed, tournament=tournament)
    captain1 = await create(TeamMemberFactory, tournament=tournament)
    captain2 = await create(TeamMemberFactory, tournament=tournament)
    team1 = await create(TeamFactory, tournament=tournament, captain=captain1)
    team2 = await create(TeamFactory, tournament=tournament, captain=captain2)
    s1 = await create(SubmissionFactory, task=t1, team=team1)
    s2 = await create(SubmissionFactory, task=t1, team=team2)
    assigned = await create(JuryAssignmentStatusOptionFactory, name=settings.JURY_ASSIGNMENT_STATUS_NAMES.ASSIGNED)
    await create(JuryAssignmentFactory, jury=jury, task=t1,
        submission=s1, status=assigned)
    await create(JuryAssignmentFactory, jury=jury, task=t1,
        submission=s2, status=assigned)
    app.dependency_overrides[get_current_user] = lambda: jury

    resp = await client.get(f'/jury/tasks/{t1.id}/assignments/')
    assert resp.status_code == 200
    assert len(resp.json()) == 2
    t_ids = [t['task_id'] for t in resp.json()]
    assert t_ids[0] == t1.id
    assert t_ids[1] == t1.id
    
    app.dependency_overrides.pop(get_current_user)

async def test_jury_assignment_draft(create, client, db_session):
    jury = await create(UserFactory)
    a = await create(JuryAssignmentFactory, jury=jury)
    app.dependency_overrides[get_current_user] = lambda: jury

    resp = await client.get(f'/jury/tasks/{a.task.id}/assignments/')
    assert resp.status_code == 400
    assert resp.json()['detail'] == 'The submissions are still open to be received!'

    
    app.dependency_overrides.pop(get_current_user)

@pytest.mark.slow
async def test_update_evaluation(create, client, db_session):
    jury = await create(UserFactory)
    t = await create(TaskFactory)
    cr1 = await create(TaskEvaluationCriterionFactory, task=t)
    cr2 = await create(TaskEvaluationCriterionFactory, task=t)
    s = await create(SubmissionFactory)
    a = await create(JuryAssignmentFactory, jury=jury, task=t)
    e = await create(SubmissionEvaluationFactory, assignment=a, submission=s)

    c1 = await create(CriterionScoreFactory, evaluation=e, criterion=cr1)
    c2 = await create(CriterionScoreFactory, evaluation=e, criterion=cr2)
    await db_session.refresh(e, ['criterion_scores'])
    comment = e.comment
    criteria = e.criterion_scores

    app.dependency_overrides[get_current_user] = lambda: jury

    resp = await client.patch(f'/jury/assignments/{a.id}/evaluation/', json={
        'comment': 'A comment',
        'criterion_scores': [
            {'criterion_id': c1.id, 'score': 7},
            {'criterion_id': c2.id, 'score': 5}
        ]
    })
    assert resp.status_code == 200
    assert resp.json()['comment'] == 'A comment'
    assert resp.json()['comment'] != comment
    assert len(resp.json()['criterion_scores']) == 2
    assert len(resp.json()['criterion_scores']) != criteria

    
    app.dependency_overrides.pop(get_current_user)

async def test_generate_assignments_no_submissions(create, client, db_session):
    organizer = await create(RoleFactory, name=settings.ROLE_NAMES.ORGANIZER)
    creator = await create(UserFactory, roles=[organizer])
    tournament = await create(TournamentFactory, creator=creator)
    closed = await create(TaskStatusOptionFactory, name=settings.TASK_STATUS_NAMES.SUBMISSION_CLOSED)
    task = await create(TaskFactory, tournament=tournament, status=closed)
    captain = await create(TeamMemberFactory, tournament=tournament)
    team = await create(TeamFactory, captain=captain, tournament=tournament)
    await create(SubmissionFactory, task=task, team=team)

    app.dependency_overrides[get_current_user] = lambda: creator
    
    resp = await client.post(f'/tournaments/{tournament.id}/tasks/{task.id}/assignments/generate/')
    assert resp.status_code == 400
    assert resp.json()['detail'] == 'Not enough juries to satisfy minimum reviews per submission'

    app.dependency_overrides.pop(get_current_user)

@pytest.mark.slow
async def test_generate_assignments_already_generated(create, client, db_session):
    organizer = await create(RoleFactory, name=settings.ROLE_NAMES.ORGANIZER)
    creator = await create(UserFactory, roles=[organizer])
    tournament = await create(TournamentFactory, creator=creator)
    closed = await create(TaskStatusOptionFactory, name=settings.TASK_STATUS_NAMES.SUBMISSION_CLOSED)
    task = await create(TaskFactory, tournament=tournament, status=closed, min_reviews_per_submission=0)
    captain = await create(TeamMemberFactory, tournament=tournament)
    team = await create(TeamFactory, captain=captain, tournament=tournament)
    submission = await create(SubmissionFactory, task=task, team=team)
    await create(JuryAssignmentFactory, task=task, submission=submission)

    app.dependency_overrides[get_current_user] = lambda: creator

    resp = await client.post(f'/tournaments/{tournament.id}/tasks/{task.id}/assignments/generate/')
    assert resp.status_code == 400
    assert resp.json()['detail'] == 'Assignments already generated for this task'

    app.dependency_overrides.pop(get_current_user)

async def test_generate_assignments_no_juries(create, client, db_session):
    organizer = await create(RoleFactory, name=settings.ROLE_NAMES.ORGANIZER)
    creator = await create(UserFactory, roles=[organizer])
    tournament = await create(TournamentFactory, creator=creator, juries=[])
    closed = await create(TaskStatusOptionFactory, name=settings.TASK_STATUS_NAMES.SUBMISSION_CLOSED)
    task = await create(TaskFactory, tournament=tournament, status=closed)
    captain = await create(TeamMemberFactory, tournament=tournament)
    team = await create(TeamFactory, captain=captain, tournament=tournament)
    await create(SubmissionFactory, task=task, team=team)
    app.dependency_overrides[get_current_user] = lambda: creator

    resp = await client.post(f'/tournaments/{tournament.id}/tasks/{task.id}/assignments/generate/')
    assert resp.status_code == 400
    assert resp.json()['detail'] == 'Not enough juries to satisfy minimum reviews per submission'

    app.dependency_overrides.pop(get_current_user)

@pytest.mark.slow
async def test_finish_task_evaluation_jury(create, client, db_session):
    jury = await create(UserFactory)
    tournament = await create(TournamentFactory, juries=[jury])
    await create(TaskStatusOptionFactory, name=settings.TASK_STATUS_NAMES.EVALUATED)
    await create(JuryAssignmentStatusOptionFactory, name=settings.JURY_ASSIGNMENT_STATUS_NAMES.REVIEWED)
    closed = await create(TaskStatusOptionFactory, name=settings.TASK_STATUS_NAMES.SUBMISSION_CLOSED)
    task = await create(TaskFactory, tournament=tournament, status=closed)
    captain = await create(TeamMemberFactory, tournament=tournament)
    team = await create(TeamFactory, captain=captain, tournament=tournament)
    submission = await create(SubmissionFactory, task=task, team=team)
    await create(JuryAssignmentFactory, jury=jury, task=task, submission=submission)
    app.dependency_overrides[get_current_user] = lambda: jury

    resp = await client.post(f'/tournaments/{tournament.id}/tasks/{task.id}/finish-evaluation/')
    assert resp.status_code == 200
    assert resp.json()['status_id'] == settings.TASK_STATUS_NAMES.EVALUATED

    app.dependency_overrides.pop(get_current_user)

@pytest.mark.slow
async def test_finish_task_evaluation_organizer(create, client, db_session):
    organizer = await create(RoleFactory, name=settings.ROLE_NAMES.ORGANIZER)
    creator = await create(UserFactory, roles=[organizer])
    tournament = await create(TournamentFactory, creator=creator, juries=[])
    await create(TaskStatusOptionFactory, name=settings.TASK_STATUS_NAMES.EVALUATED)
    await create(JuryAssignmentStatusOptionFactory, name=settings.JURY_ASSIGNMENT_STATUS_NAMES.REVIEWED)
    closed = await create(TaskStatusOptionFactory, name=settings.TASK_STATUS_NAMES.SUBMISSION_CLOSED)
    task = await create(TaskFactory, tournament=tournament, status=closed)
    captain = await create(TeamMemberFactory, tournament=tournament)
    team = await create(TeamFactory, captain=captain, tournament=tournament)
    submission = await create(SubmissionFactory, task=task, team=team)
    await create(JuryAssignmentFactory, task=task, submission=submission)
    app.dependency_overrides[get_current_user] = lambda: creator

    resp = await client.post(f'/tournaments/{tournament.id}/tasks/{task.id}/finish-evaluation/')
    assert resp.status_code == 200
    assert resp.json()['status_id'] == settings.TASK_STATUS_NAMES.EVALUATED

    app.dependency_overrides.pop(get_current_user)

@pytest.mark.slow
async def test_finish_tournament_evaluation_jury(create, client, db_session):
    organizer = await create(RoleFactory, name=settings.ROLE_NAMES.ORGANIZER)
    creator = await create(UserFactory, roles=[organizer])
    jury = await create(UserFactory)
    await create(TaskStatusOptionFactory, name=settings.TASK_STATUS_NAMES.EVALUATED)
    await create(JuryAssignmentStatusOptionFactory, name=settings.JURY_ASSIGNMENT_STATUS_NAMES.REVIEWED)
    assigned = await create(JuryAssignmentStatusOptionFactory, name=settings.JURY_ASSIGNMENT_STATUS_NAMES.ASSIGNED)
    closed = await create(TaskStatusOptionFactory, name=settings.TASK_STATUS_NAMES.SUBMISSION_CLOSED)
    tournament_statuses = {}
    for opt_name in [o["name"] for o in settings.TOURNAMENT_STATUS_OPTIONS]:
        tournament_statuses[opt_name] = await create(TournamentStatusOptionFactory, name=opt_name)
    tournament = await create(TournamentFactory, creator=creator, juries=[], status=tournament_statuses["draft"])
    task = await create(TaskFactory, tournament=tournament, status=closed)
    team = await create(TeamFactory, tournament=tournament, captain=None)
    captain = await create(TeamMemberFactory, tournament=tournament, team=team)
    team.captain = captain
    await db_session.flush()
    submission = await create(SubmissionFactory, task=task, team=team)
    await create(JuryAssignmentFactory, jury=jury, task=task, submission=submission, status=assigned)
    app.dependency_overrides[get_current_user] = lambda: jury

    resp = await client.post(f'/tournaments/{tournament.id}/finish-evaluation/')
    assert resp.status_code == 403

    app.dependency_overrides.pop(get_current_user)

@pytest.mark.slow
async def test_finish_tournament_evaluation_organizer(create, client, db_session):
    organizer = await create(RoleFactory, name=settings.ROLE_NAMES.ORGANIZER)
    creator = await create(UserFactory, roles=[organizer])
    await create(TaskStatusOptionFactory, name=settings.TASK_STATUS_NAMES.EVALUATED)
    await create(JuryAssignmentStatusOptionFactory, name=settings.JURY_ASSIGNMENT_STATUS_NAMES.REVIEWED)
    assigned = await create(JuryAssignmentStatusOptionFactory, name=settings.JURY_ASSIGNMENT_STATUS_NAMES.ASSIGNED)
    closed = await create(TaskStatusOptionFactory, name=settings.TASK_STATUS_NAMES.SUBMISSION_CLOSED)
    tournament_statuses = {}
    for opt_name in [o["name"] for o in settings.TOURNAMENT_STATUS_OPTIONS]:
        tournament_statuses[opt_name] = await create(TournamentStatusOptionFactory, name=opt_name)
    tournament = await create(TournamentFactory, creator=creator, juries=[], status=tournament_statuses["draft"])
    task = await create(TaskFactory, tournament=tournament, status=closed)
    team = await create(TeamFactory, tournament=tournament, captain=None)
    captain = await create(TeamMemberFactory, tournament=tournament, team=team)
    team.captain = captain
    await db_session.flush()
    submission = await create(SubmissionFactory, task=task, team=team)
    await create(JuryAssignmentFactory, task=task, submission=submission, status=assigned)
    app.dependency_overrides[get_current_user] = lambda: creator

    resp = await client.post(f'/tournaments/{tournament.id}/finish-evaluation/')
    assert resp.status_code == 200
    assert resp.json()['status']['name'] == settings.TOURNAMENT_STATUS_NAMES.FINISHED

    app.dependency_overrides.pop(get_current_user)


# Integration 

@pytest.mark.slow
async def test_generate_assignments_and_submit_evaluation(create, client, db_session):
    admin_role = await create(RoleFactory, name=settings.ROLE_NAMES.ADMIN)
    organizer = await create(UserFactory, roles=[admin_role])
    jury1 = await create(UserFactory)
    jury2 = await create(UserFactory)
    participant = await create(UserFactory)

    tournament_status = await create(
        TournamentStatusOptionFactory, name=settings.TOURNAMENT_STATUS_NAMES.DRAFT
    )
    await create(TaskStatusOptionFactory, name=settings.TASK_STATUS_NAMES.DRAFT)
    await create(
        JuryAssignmentStatusOptionFactory, name=settings.JURY_ASSIGNMENT_STATUS_NAMES.ASSIGNED
    )
    closed = await create(TaskStatusOptionFactory, name=settings.TASK_STATUS_NAMES.SUBMISSION_CLOSED)
    tournament = await create(TournamentFactory, creator=organizer, status=tournament_status)
    await db_session.refresh(tournament, ["juries"])
    tournament.juries.extend([jury1, jury2])

    task = await create(TaskFactory, tournament=tournament, min_reviews_per_submission=2, status=closed)
    criterion = TaskEvaluationCriterion(
        task_id=task.id,
        name="Completeness",
        weight=1,
        max_score=10,
    )
    db_session.add(criterion)

    team = await create(TeamFactory, tournament=tournament)
    await create(TeamMemberFactory, team=team, tournament=tournament, email=participant.email)
    option = await create(SubmissionUrlOptionFactory, name="github")
    await db_session.commit()

    app.dependency_overrides[get_current_user] = lambda: participant
    submission_resp = await client.post(
        f"/tournaments/{tournament.id}/tasks/{task.id}/submissions/",
        json={
            "team_id": team.id,
            "urls": [{"url_id": option.name, "value": "https://github.com/example/repo"}],
        },
    )
    assert submission_resp.status_code == 201

    app.dependency_overrides[get_current_user] = lambda: organizer
    generate_resp = await client.post(
        f"/tournaments/{tournament.id}/tasks/{task.id}/assignments/generate/"
    )
    assert generate_resp.status_code == 200
    assert len(generate_resp.json()) == 2

    app.dependency_overrides[get_current_user] = lambda: jury1
    assignments_resp = await client.get(f"/jury/tasks/{task.id}/assignments/")
    assert assignments_resp.status_code == 200
    assignment = assignments_resp.json()[0]

    evaluation_resp = await client.post(
        f"/jury/assignments/{assignment['id']}/evaluation/",
        json={
            "comment": "Solid work",
            "criterion_scores": [{"criterion_id": criterion.id, "score": 8}],
        },
    )
    assert evaluation_resp.status_code == 201
    assert evaluation_resp.json()["comment"] == "Solid work"

    app.dependency_overrides.pop(get_current_user)
