import random

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from app.config import settings

from app.dependencies import (
    CurrentUserDep,
    SessionDep,
    current_user_dependency,
    organizer_or_admin_dependency,
    assigned_jury_dependency,
)
from app.models import (
    JuryAssignment,
    CriterionScore,
    Submission,
    SubmissionEvaluation,
    SubmissionUrl,
    Task,
    Team,
)
from app.schemas import (
    EvaluationLeaderboardEntry,
    JuryAssignmentPublic,
    JuryAssignmentPublic,
    SubmissionEvaluationCreate,
    SubmissionEvaluationUpdate,
    SubmissionEvaluationPublic,
    TaskPublic,
)
from app.utils import get_task_by_tournament, get_tournament, get_assignment, get_criterion

router = APIRouter(tags=["jury"])


def _criterion_map(task: Task) -> dict[int, object]:
    return {criterion.id: criterion for criterion in task.criteria}


def _calculate_evaluation_total(evaluation: SubmissionEvaluation) -> float:
    weighted = 0.0
    total_weight = 0
    for item in evaluation.criterion_scores:
        weight = item.criterion.weight
        total_weight += weight
        weighted += (item.score / item.criterion.max_score) * weight * 100
    if total_weight == 0:
        return 0.0
    return round(weighted / total_weight, 2)


async def _task_leaderboard(
    task_id: int, session: SessionDep
) -> list[EvaluationLeaderboardEntry]:
    statement = (
        select(Submission)
        .where(Submission.task_id == task_id)
        .options(
            selectinload(Submission.team),
            selectinload(Submission.evaluations)
            .selectinload(SubmissionEvaluation.criterion_scores)
            .selectinload(CriterionScore.criterion),
        )
    )
    submissions = (await session.execute(statement)).scalars().unique().all()
    leaderboard = []
    for submission in submissions:
        totals = [
            _calculate_evaluation_total(evaluation) for evaluation in submission.evaluations
        ]
        if totals:
            average_score = round(sum(totals) / len(totals), 2)
            total_score = round(sum(totals), 2)
        else:
            average_score = 0.0
            total_score = 0.0
        leaderboard.append(
            EvaluationLeaderboardEntry(
                submission_id=submission.team_id,
                team_id=submission.team_id,
                team_name=submission.team.name,
                average_score=average_score,
                total_score=total_score,
                submitted_reviews=len(totals),
            )
        )
    return sorted(leaderboard, key=lambda item: (-item.average_score, item.team_name.lower()))


@router.get(
    "/jury/tasks", response_model=list[TaskPublic], dependencies=[current_user_dependency]
)
async def jury_tasks(current_user: CurrentUserDep, session: SessionDep):
    statement = (
        select(Task)
        .join(Task.jury_assignments)
        .where(
            JuryAssignment.jury_id == current_user.id,
            Task.status_id == settings.TASK_STATUS_NAMES.SUBMISSION_CLOSED,
        )
        .options(selectinload(Task.criteria))
        .distinct()
    )
    return (await session.execute(statement)).scalars().unique().all()


@router.get(
    "/jury/tasks/{task_id}/assignments",
    response_model=list[JuryAssignmentPublic],
    dependencies=[current_user_dependency],
)
async def jury_task_assignments(
    task_id: int, current_user: CurrentUserDep, session: SessionDep
):
    statement = (
        select(JuryAssignment)
        .where(JuryAssignment.task_id == task_id, JuryAssignment.jury_id == current_user.id)
        .options(
            selectinload(JuryAssignment.status),
            selectinload(JuryAssignment.task).selectinload(Task.criteria),
            selectinload(JuryAssignment.submission)
            .selectinload(Submission.team)
            .selectinload(Team.members),
            selectinload(JuryAssignment.submission)
            .selectinload(Submission.team)
            .selectinload(Team.tournament),
            selectinload(JuryAssignment.submission)
            .selectinload(Submission.urls)
            .selectinload(SubmissionUrl.url),
            selectinload(JuryAssignment.evaluation).selectinload(
                SubmissionEvaluation.criterion_scores
            ),
        )
    )
    return (await session.execute(statement)).scalars().unique().all()


@router.get(
    "/jury/assignments/{assignment_id}",
    response_model=JuryAssignmentPublic,
    dependencies=[current_user_dependency, assigned_jury_dependency],
)
async def jury_assignment_detail(assignment_id: int, session: SessionDep):
    assignment = await get_assignment(assignment_id, session)
    return assignment


@router.post(
    "/jury/assignments/{assignment_id}/evaluation",
    response_model=SubmissionEvaluationPublic,
    status_code=status.HTTP_201_CREATED,
    dependencies=[current_user_dependency, assigned_jury_dependency],
)
async def create_evaluation(
    assignment_id: int,
    payload: SubmissionEvaluationCreate,
    current_user: CurrentUserDep,
    session: SessionDep,
):
    assignment = await get_assignment(assignment_id, session)
    if assignment.evaluation is not None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Evaluation already exists")

    criteria = _criterion_map(assignment.task)
    evaluation = SubmissionEvaluation(
        assignment_id=assignment.id,
        submission_id=assignment.submission_id,
        jury_id=current_user.id,
        comment=payload.comment,
    )
    for item in payload.criterion_scores:
        criterion = criteria.get(item.criterion_id)
        if criterion is None:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Criterion not found")
        if item.score > criterion.max_score:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                detail=f"Score for criterion {criterion.name} exceeds max score",
            )
        evaluation.criterion_scores.append(CriterionScore(**item.model_dump()))

    assignment.status_id = settings.JURY_ASSIGNMENT_STATUS_NAMES.SUBMITTED
    session.add(evaluation)
    await session.commit()
    await session.refresh(evaluation)
    return evaluation


@router.patch(
    "/jury/assignments/{assignment_id}/evaluation",
    response_model=SubmissionEvaluationPublic,
    dependencies=[current_user_dependency, assigned_jury_dependency],
)
async def update_evaluation(
    assignment_id: int,
    update_data: SubmissionEvaluationUpdate,
    current_user: CurrentUserDep,
    session: SessionDep,
):
    payload = update_data.model_dump(exclude_unset=True)
    assignment = await get_assignment(assignment_id, session)
    if assignment.evaluation is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Evaluation not found")

    criterions = _criterion_map(assignment.task)

    for item in payload.pop("criterion_scores"):
        criterion = await get_criterion(item["criterion_id"], session)
        if item["score"] > criterions[item["criterion_id"]].max_score:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                detail=f"Score for criterion {criterion.name} exceeds max score",
            )
        criterion.score = item["score"]

    if update_data:
        result = await session.execute(
            update(SubmissionEvaluation)
            .where(SubmissionEvaluation.id == assignment.evaluation.id)
            .values(**payload)
            .returning(SubmissionEvaluation)
        )
        evaluation = result.scalar_one_or_none()
        if not evaluation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Evaluation not found"
            )
    await session.commit()
    await session.refresh(assignment.evaluation)
    return assignment.evaluation


@router.post(
    "/tournaments/{tournament_id}/tasks/{task_id}/jury-assignments/generate",
    response_model=list[JuryAssignmentPublic],
    dependencies=[current_user_dependency, organizer_or_admin_dependency],
)
async def generate_jury_assignments(
    tournament_id: int,
    task_id: int,
    session: SessionDep,
):
    task = await get_task_by_tournament(tournament_id, task_id, session)
    tournament = task.tournament

    juries = list(tournament.juries)
    submissions = (
        (
            await session.execute(
                select(Submission)
                .join(Submission.team)
                .where(Submission.task_id == task.id, Team.tournament_id == tournament.id)
                .options(selectinload(Submission.team))
            )
        )
        .scalars()
        .unique()
        .all()
    )
    if not submissions:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="No submissions to assign")
    if len(juries) < task.min_reviews_per_submission:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="Not enough juries to satisfy minimum reviews per submission",
        )

    existing = (
        (
            await session.execute(
                select(JuryAssignment).where(JuryAssignment.task_id == task.id)
            )
        )
        .scalars()
        .all()
    )
    if existing:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="Assignments already generated for this task",
        )

    jury_loads = {jury.id: 0 for jury in juries}
    created = []
    randomized_submissions = list(submissions)
    random.shuffle(randomized_submissions)
    for submission in randomized_submissions:
        available = sorted(
            juries,
            key=lambda jury: (jury_loads[jury.id], random.random()),
        )
        selected = available[: task.min_reviews_per_submission]
        for jury in selected:
            assignment = JuryAssignment(
                task_id=task.id,
                submission_id=submission.team_id,
                jury_id=jury.id,
                status_id=settings.JURY_ASSIGNMENT_STATUS_NAMES.ASSIGNED,
            )
            session.add(assignment)
            created.append(assignment)
            jury_loads[jury.id] += 1

    await session.commit()

    # Refresh created assignments with status and evaluation relationships
    created_ids = [a.id for a in created]
    statement = (
        select(JuryAssignment)
        .where(JuryAssignment.id.in_(created_ids))
        .options(selectinload(JuryAssignment.status), selectinload(JuryAssignment.evaluation))
    )
    result = (await session.execute(statement)).scalars().unique().all()
    return result


@router.get(
    "/tournaments/{tournament_id}/tasks/{task_id}/jury-assignments",
    response_model=list[JuryAssignmentPublic],
    dependencies=[current_user_dependency, organizer_or_admin_dependency],
)
async def get_task_assignments(
    tournament_id: int,
    task_id: int,
    current_user: CurrentUserDep,
    session: SessionDep,
):
    task = await get_task_by_tournament(tournament_id, task_id, session)
    statement = (
        select(JuryAssignment)
        .where(JuryAssignment.task_id == task.id)
        .options(
            selectinload(JuryAssignment.status),
            selectinload(JuryAssignment.task).selectinload(Task.criteria),
            selectinload(JuryAssignment.submission)
            .selectinload(Submission.team)
            .selectinload(Team.members),
            selectinload(JuryAssignment.submission)
            .selectinload(Submission.team)
            .selectinload(Team.tournament),
            selectinload(JuryAssignment.submission)
            .selectinload(Submission.urls)
            .selectinload(SubmissionUrl.url),
            selectinload(JuryAssignment.evaluation).selectinload(
                SubmissionEvaluation.criterion_scores
            ),
        )
    )
    return (await session.execute(statement)).scalars().unique().all()


@router.post(
    "/tournaments/{tournament_id}/tasks/{task_id}/finish-evaluation",
    response_model=TaskPublic,
    dependencies=[organizer_or_admin_dependency],
)
async def finish_evaluation(
    tournament_id: int,
    task_id: int,
    current_user: CurrentUserDep,
    session: SessionDep,
):
    task = await get_task_by_tournament(tournament_id, task_id, session)
    if task.status_id != settings.TASK_STATUS_NAMES.SUBMISSION_CLOSED:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="The submissions are still open to be received!",
        )

    jury_assignmnents = (
        (
            await session.execute(
                select(JuryAssignment).where(
                    JuryAssignment.task_id == task.id,
                    JuryAssignment.jury_id == current_user.id,
                )
            )
        )
        .scalars()
        .all()
    )

    for a in jury_assignmnents:
        a.status_id = settings.JURY_ASSIGNMENT_STATUS_NAMES.REVIEWED

    await session.commit()
    await session.refresh(task, ["jury_assignments"])

    nonevaluated_assignments = [
        a
        for a in task.jury_assignments
        if a.status.name != settings.JURY_ASSIGNMENT_STATUS_NAMES.REVIEWED
    ]
    # If all the submissions were evaluated, mark the task as evaluated
    if len(nonevaluated_assignments) == 0:
        task.status_id = settings.TASK_STATUS_NAMES.EVALUATED
    await session.commit()
    await session.refresh(task)
    return task


# All the leaderboard functionality is poor quality
# TODO?: refactor leaderboard functionality if we have enough time


@router.get(
    "/tournaments/{tournament_id}/tasks/{task_id}/leaderboard",
    response_model=list[EvaluationLeaderboardEntry],
)
async def task_leaderboard(tournament_id: int, task_id: int, session: SessionDep):
    task = await get_task_by_tournament(tournament_id, task_id, session)
    tournament = task.tournament
    if (
        not task.is_leaderboard_visible
        or tournament.status_id != settings.TOURNAMENT_STATUS_NAMES.FINISHED
    ):
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Leaderboard is hidden")
    return await _task_leaderboard(task.id, session)


@router.get(
    "/tournaments/{tournament_id}/leaderboard",
    response_model=list[EvaluationLeaderboardEntry],
)
async def tournament_leaderboard(tournament_id: int, session: SessionDep):
    tournament = await get_tournament(tournament_id, session)
    team_scores: dict[int, EvaluationLeaderboardEntry] = {}
    for task in tournament.tasks:
        if task.status_id != settings.TASK_STATUS_NAMES.EVALUATED:
            continue
        for entry in await _task_leaderboard(task.id, session):
            existing = team_scores.get(entry.team_id)
            if existing is None:
                team_scores[entry.team_id] = entry.model_copy()
                continue
            existing.total_score = round(existing.total_score + entry.average_score, 2)
            existing.submitted_reviews += entry.submitted_reviews
            existing.average_score = round(
                existing.total_score
                / max(1, len([t for t in tournament.tasks if t.status_id == "evaluated"])),
                2,
            )
    return sorted(
        team_scores.values(), key=lambda item: (-item.total_score, item.team_name.lower())
    )
