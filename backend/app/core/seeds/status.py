from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models import TournamentStatusOption, TaskStatusOption


async def _upsert_option(session: AsyncSession, model, *, name: str, display_name: str):
    statement = select(model).where(model.name == name)
    result = await session.execute(statement)
    option = result.scalar_one_or_none()

    if option is None:
        session.add(model(name=name, display_name=display_name))
        return

    if option.display_name != display_name:
        option.display_name = display_name


async def init_tournament_statuses(session: AsyncSession):
    for option in settings.TOURNAMENT_STATUS_OPTIONS:
        await _upsert_option(
            session,
            TournamentStatusOption,
            name=option["name"],
            display_name=option["display_name"],
        )

    await session.commit()


async def init_task_statuses(session: AsyncSession):
    for option in settings.TASK_STATUS_OPTIONS:
        await _upsert_option(
            session,
            TaskStatusOption,
            name=option["name"],
            display_name=option["display_name"],
        )

    await session.commit()
