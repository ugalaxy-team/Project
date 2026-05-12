from sqlalchemy import select
from app.models import CriterionScore
from app.dependencies import SessionDep
from fastapi import HTTPException, status


async def get_criterion(criterion_id: int, session: SessionDep) -> CriterionScore:
    statement = select(CriterionScore).where(CriterionScore.criterion_id == criterion_id)

    criterion = (await session.execute(statement)).scalar()
    if not criterion:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Criterion not found!")
    return criterion
