from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.config import settings
from app.models import Task, JuryAssignment
from app.dependencies import SessionDep


async def finish_evaluation(task: Task, assignments: list[JuryAssignment], session: SessionDep) -> Task:
    for a in assignments:
        a.status_id = settings.JURY_ASSIGNMENT_STATUS_NAMES.REVIEWED

    await session.commit()

    result = await session.execute(
        select(JuryAssignment).where(JuryAssignment.task_id == task.id).options(selectinload(JuryAssignment.status))
    )
    all_assignments = result.scalars().all()

    nonevaluated_assignments = [
        a
        for a in all_assignments
        if a.status_id != settings.JURY_ASSIGNMENT_STATUS_NAMES.REVIEWED
    ]
    if len(nonevaluated_assignments) == 0:
        task.status_id = settings.TASK_STATUS_NAMES.EVALUATED
    await session.commit()
    await session.refresh(task, ["status"])
    return task