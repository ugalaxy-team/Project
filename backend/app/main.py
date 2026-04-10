from fastapi import FastAPI
from contextlib import asynccontextmanager

import app.routes.tournaments as tournaments
import app.routes.users as users
import app.routes.profile as profile
import app.routes.tasks as tasks
import app.routes.submissions as submissions
import app.routes.teams as teams
import app.routes.team_members as team_members
import app.routes.task_options as task_options

from app.core.seeds import init_tournament_statuses, init_task_statuses, init_categories
from app.db import AsyncSessionLocal


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with AsyncSessionLocal() as session:
        await init_tournament_statuses(session)
        await init_task_statuses(session)
        await init_categories(session)
    yield


app = FastAPI(lifespan=lifespan)

app.include_router(tournaments.router)
app.include_router(users.router)
app.include_router(profile.router)
app.include_router(tasks.router)
app.include_router(submissions.router)
app.include_router(teams.router)
app.include_router(team_members.router)
app.include_router(task_options.router)
