
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.dependencies import (
    SessionDep
)
from app.models import (
    CriterionScore,
    Submission,
    SubmissionEvaluation,
)
from app.schemas import (
    EvaluationLeaderboardEntry,
)

def calculate_evaluation_total(evaluation: SubmissionEvaluation) -> float:
    total_score = 0
    for item in evaluation.criterion_scores:
        total_score += (item.score / item.criterion.max_score) * item.criterion.weight
    return round(total_score, 2)


async def get_task_leaderboard(
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
            calculate_evaluation_total(evaluation) for evaluation in submission.evaluations
        ]
        if totals:
            average_score = round(sum(totals) / len(totals), 2)
            total_score = round(sum(totals), 2)
        else:
            average_score = 0.0
            total_score = 0.0
        leaderboard.append(
            EvaluationLeaderboardEntry(
                submission_id=submission.id,
                team_id=submission.team_id,
                team_name=submission.team.name,
                average_score=average_score,
                total_score=total_score,
            )
        )
    return sorted(leaderboard, key=lambda item: (-item.average_score, item.team_name.lower()))