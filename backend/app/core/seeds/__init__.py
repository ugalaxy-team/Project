from .categories import init_categories
from .roles import init_roles
from .status import init_task_statuses, init_tournament_statuses
from .role_requests import init_role_request_options


async def init_static_data(session):
    await init_roles(session)
    await init_tournament_statuses(session)
    await init_task_statuses(session)
    await init_categories(session)
    await init_role_request_options(session)
