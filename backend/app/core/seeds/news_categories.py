from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models import NewsCattegory


async def init_news_categories(session: AsyncSession):
    for option in settings.NEWS_CATEGORY_OPTIONS:
        statement = select(NewsCattegory).where(NewsCattegory.name == option["name"])
        result = await session.execute(statement)
        category = result.scalar_one_or_none()

        if category is None:
            session.add(
                NewsCattegory(
                    name=option["name"],
                    display_name=option["display_name"],
                )
            )
            continue

        if category.display_name != option["display_name"]:
            category.display_name = option["display_name"]

    await session.commit()
