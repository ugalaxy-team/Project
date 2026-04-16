from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import TournamentStatusOption, TaskStatusOption

DEFAULT_TOURNAMENT_STATUSES = {
    "draft": "Draft",
    "registration": "Registration",
    "running": "Running",
    "finished": "Finished",
    "canceled": "Canceled",
}

DEFAULT_TASK_STATUSES = {
    "draft": "Draft",
    "active": "Active",
    "submission_closed": "SubmissionClosed",
    "evaluated": "Evaluated",
}


async def init_tournament_statuses(session: AsyncSession):
    for name, display in DEFAULT_TOURNAMENT_STATUSES.items():
        statement = select(TournamentStatusOption).where(
            TournamentStatusOption.name == name
        )
        result = await session.execute(statement)
        if not result.scalar_one_or_none():
            session.add(TournamentStatusOption(name=name, display_name=display))

    await session.commit()


async def init_task_statuses(session: AsyncSession):
    for name, display in DEFAULT_TASK_STATUSES.items():
        statement = select(TaskStatusOption).where(TaskStatusOption.name == name)
        result = await session.execute(statement)

        if not result.scalar_one_or_none():
            session.add(TaskStatusOption(name=name, display_name=display))

    await session.commit()
