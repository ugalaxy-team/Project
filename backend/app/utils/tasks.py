from fastapi import HTTPException, status
from sqlalchemy import select
from app.dependencies.session import SessionDep
from app.models import Task, TaskRequirementOption


async def get_task(task_id: int, session: SessionDep) -> Task:
    statement = select(Task).where(Task.id == task_id)
    task = (await session.execute(statement)).scalar()
    if not task:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Task not found!")
    return task


async def get_requirements(
    requirement_names: list[str], session: SessionDep
) -> list[TaskRequirementOption]:

    if not requirement_names:
        return []

    stmt = select(TaskRequirementOption).where(
        TaskRequirementOption.name.in_(requirement_names)
    )
    result = await session.execute(stmt)
    req_options = result.scalars().all()

    if len(req_options) != len(requirement_names):
        found_names = {opt.name for opt in req_options}
        missing = set(requirement_names) - found_names
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Requirement options not found: {', '.join(missing)}",
        )

    return list(req_options)
