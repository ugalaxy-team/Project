from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import TaskRequirementCategory

CATEGORIES = [
    {"name": "Languages", "main_id": None},
    {"name": "Backend", "main_id": None},
    {"name": "Frontend", "main_id": None},
    {"name": "Databases", "main_id": None},
    {"name": "Infrastructure", "main_id": None},
    {"name": "Mobile", "main_id": None},
    {"name": "Design & UI/UX", "main_id": None},
    {"name": "SQL", "main_id": "Databases"},
    {"name": "NoSQL", "main_id": "Databases"},
    {"name": "Vector DB", "main_id": "Databases"},
    {"name": "Frameworks", "main_id": "Backend"},
    {"name": "JS Frameworks", "main_id": "Frontend"},
    {"name": "State Management", "main_id": "Frontend"},
    {"name": "DevOps", "main_id": "Infrastructure"},
    {"name": "Cloud", "main_id": "Infrastructure"},
    {"name": "Monitoring", "main_id": "Infrastructure"},
]


async def init_categories(session: AsyncSession):
    parents = [p for p in CATEGORIES if p["main_id"] is None]
    children = [c for c in CATEGORIES if c["main_id"] is not None]

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
