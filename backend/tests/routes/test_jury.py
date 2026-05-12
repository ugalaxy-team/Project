from app import app
from app.dependencies import get_current_user
from app.models import TaskEvaluationCategory, TaskEvaluationCriterion
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
)
from app.config import settings


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

    tournament = await create(TournamentFactory, creator=organizer, status=tournament_status)
    await db_session.refresh(tournament, ["juries"])
    tournament.juries.extend([jury1, jury2])

    task = await create(TaskFactory, tournament=tournament, min_reviews_per_submission=2)
    category = TaskEvaluationCategory(task=task, name="Functionality")
    criterion = TaskEvaluationCriterion(
        category=category,
        name="Completeness",
        weight=1,
        max_score=10,
    )
    db_session.add_all([category, criterion])

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
        f"/tournaments/{tournament.id}/tasks/{task.id}/jury-assignments/generate"
    )
    assert generate_resp.status_code == 200
    assert len(generate_resp.json()) == 2

    app.dependency_overrides[get_current_user] = lambda: jury1
    assignments_resp = await client.get(f"/jury/tasks/{task.id}/assignments")
    assert assignments_resp.status_code == 200
    assignment = assignments_resp.json()[0]

    evaluation_resp = await client.post(
        f"/jury/assignments/{assignment['id']}/evaluation",
        json={
            "comment": "Solid work",
            "criterion_scores": [{"criterion_id": criterion.id, "score": 8}],
        },
    )
    assert evaluation_resp.status_code == 201
    assert evaluation_resp.json()["comment"] == "Solid work"

    app.dependency_overrides.pop(get_current_user)
