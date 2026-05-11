from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models import Role


async def init_roles(session: AsyncSession):
    for option in settings.ROLE_OPTIONS:
        statement = select(Role).where(Role.name == option["name"])
        result = await session.execute(statement)
        role = result.scalar_one_or_none()

        if role is None:
            session.add(Role(**option))
            continue

        role.display_name = option["display_name"]
        role.description = option["description"]

    await session.commit()
