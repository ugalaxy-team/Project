from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import RoleRequestInfoOption
from app.config import settings


async def init_role_request_options(session: AsyncSession):
    options = settings.ROLE_REQUEST_INFO_OPTIONS

    for opt in options:

        stmt = select(RoleRequestInfoOption).where(
            RoleRequestInfoOption.name == opt["name"]
        )
        result = await session.execute(stmt)
        existing_option = result.scalar_one_or_none()

        if not existing_option:

            session.add(
                RoleRequestInfoOption(
                    name=opt["name"], display_name=opt["display_name"]
                )
            )
        else:

            if existing_option.display_name != opt["display_name"]:
                existing_option.display_name = opt["display_name"]

    await session.commit()
