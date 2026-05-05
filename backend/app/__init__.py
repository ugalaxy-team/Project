import socketio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.routes.news as news
import app.routes.profile as profile
import app.routes.role_requests as role_requests
import app.routes.roles as roles
import app.routes.task_options as task_options
import app.routes.tasks as tasks
import app.routes.team_members as team_members
import app.routes.teams as teams
import app.routes.tournaments as tournaments
import app.routes.users as users

from app.core.seeds import init_static_data
from app.db import AsyncSessionLocal
from .config import settings
from .admin import setup_admin


# temporary decision
@asynccontextmanager
async def lifespan(app: FastAPI):
    async with AsyncSessionLocal() as session:
        await init_static_data(session)
    yield


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.state.user_websocket_sessions = {}


app.include_router(news.router)
app.include_router(profile.router)
app.include_router(role_requests.router)
app.include_router(roles.router)
app.include_router(task_options.router)
app.include_router(tasks.router)
app.include_router(team_members.router)
app.include_router(teams.router)
app.include_router(tournaments.router)
app.include_router(users.router)

from .websockets import *

socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

setup_admin(app)
