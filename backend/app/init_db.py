import asyncio
from app.models import Base
from app.db import engine


async def init_db() -> None:
    async with engine.connect() as conn:
        await conn.run_sync(Base.metadata.create_all)


if __name__ == "__main__":
    asyncio.run(init_db())
