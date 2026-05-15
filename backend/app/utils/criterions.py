from sqlalchemy import select, or_
from app.models import CriterionScore, TaskEvaluationCriterion, Task
from app.dependencies import SessionDep
from fastapi import HTTPException, status

def get_criterion_map(task: Task) -> dict[int, TaskEvaluationCriterion]:
    return {criterion.id: criterion for criterion in task.criteria}

async def get_criterion_score(criterion_id: int, session: SessionDep) -> CriterionScore:
    statement = select(CriterionScore).where(CriterionScore.criterion_id == criterion_id)

    criterion = (await session.execute(statement)).scalar()
    if not criterion:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Criterion not found!")
    return criterion

async def get_task_evaluation_criterion(identifier: str | int, session: SessionDep) -> TaskEvaluationCriterion:
    statement = select(TaskEvaluationCriterion).where(or_(TaskEvaluationCriterion.name == identifier, TaskEvaluationCriterion.id == identifier))

    criterion = (await session.execute(statement)).scalar()
    if not criterion:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Criterion not found!")
    return criterion