import asyncio
from sqlalchemy.ext.asyncio import async_sessionmaker
from app.core.seeds import init_static_data
from app.models import Base
from app.db import engine


SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as session:
        await init_static_data(session)


if __name__ == "__main__":
    asyncio.run(init_db())
