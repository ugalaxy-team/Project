from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import TournamentStatusOption

DEFAULT_STATUSES = ["Draft", "Registration", "Running", "Finished"]


async def init_tournament_statuses(session: AsyncSession):
    for status_name in DEFAULT_STATUSES:
        statement = select(TournamentStatusOption).where(
            TournamentStatusOption.name == status_name
        )
        result = await session.execute(statement)
        if not result.scalar_one_or_none():
            session.add(TournamentStatusOption(name=status_name))

    await session.commit()
