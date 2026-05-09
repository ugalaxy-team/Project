from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import TaskRequirementOption
from app.config import settings


async def init_task_requirement_options(session: AsyncSession):
    options = settings.REQUIREMENT_OPTIONS

    for opt in options:
        stmt = select(TaskRequirementOption).where(
            TaskRequirementOption.name == opt["name"]
        )
        result = await session.execute(stmt)
        existing_option = result.scalar_one_or_none()

        if not existing_option:
            session.add(
                TaskRequirementOption(
                    name=opt["name"],
                    display_name=opt["display_name"],
                    category_id=opt["category_id"],
                )
            )
        else:
            if existing_option.display_name != opt["display_name"]:
                existing_option.display_name = opt["display_name"]
            if existing_option.category_id != opt["category_id"]:
                existing_option.category_id = opt["category_id"]

    await session.commit()
