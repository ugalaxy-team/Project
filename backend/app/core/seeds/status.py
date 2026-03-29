from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import TournamentStatusOption

DEFAULT_STATUSES = {
    "draft": "Draft",
    "registration": "Registration",
    "running": "Running",
    "finished": "Finished",
    "canceled": "Canceled",
}


async def init_tournament_statuses(session: AsyncSession):
    for name, display in DEFAULT_STATUSES.items():
        statement = select(TournamentStatusOption).where(
            TournamentStatusOption.name == name
        )
        result = await session.execute(statement)
        if not result.scalar_one_or_none():
            session.add(TournamentStatusOption(name=name, display_name=display))

    await session.commit()
