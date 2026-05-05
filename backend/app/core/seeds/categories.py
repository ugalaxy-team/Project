from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import TaskRequirementCategory
from app.config import settings


async def init_categories(session: AsyncSession):
    all_categories = settings.CATEGORY_LIST

    parents = [p for p in all_categories if p["main_id"] is None]
    children = [c for c in all_categories if c["main_id"] is not None]

    for item in parents:
        stmt = select(TaskRequirementCategory).where(
            TaskRequirementCategory.name == item["name"]
        )
        result = await session.execute(stmt)
        if not result.scalar_one_or_none():
            session.add(
                TaskRequirementCategory(
                    name=item["name"], display_name=item["name"], main_id=None
                )
            )

    await session.commit()

    for item in children:
        stmt = select(TaskRequirementCategory).where(
            TaskRequirementCategory.name == item["name"]
        )
        if not (await session.execute(stmt)).scalar_one_or_none():
            p_stmt = select(TaskRequirementCategory).where(
                TaskRequirementCategory.name == item["main_id"]
            )
            if (await session.execute(p_stmt)).scalar_one_or_none():
                session.add(
                    TaskRequirementCategory(
                        name=item["name"],
                        display_name=item["name"],
                        main_id=item["main_id"],
                    )
                )

    await session.commit()
