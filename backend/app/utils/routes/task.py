from fastapi import status, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import TaskRequirementOption


async def get_requirements(
    requirement_names: list[str], session: AsyncSession
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
