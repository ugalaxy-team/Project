from fastapi import FastAPI
import app.routes.tournaments as tournaments
import app.routes.users as users
import app.routes.profile as profile
import app.routes.role_requests as role_requests
import app.routes.roles as roles
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
import socketio
import uvicorn

app = FastAPI()
app.state.user_websocket_sessions = {}

from .websockets import *

socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tournaments.router)
app.include_router(users.router)
app.include_router(profile.router)
app.include_router(role_requests.router)
app.include_router(roles.router)

