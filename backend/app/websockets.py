import socketio
from app.config import settings
from app.dependencies import get_current_user, get_session
from app import app

sio = socketio.AsyncServer(
    cors_allowed_origins=settings.CORS_ORIGINS,
    async_mode='asgi'
)

@sio.event
async def connect(sid, environ, auth: str):
    async for session in get_session():
        user = await get_current_user(session, auth['token'])
        app.state.user_websocket_sessions[user.id] = {
            'sid': sid
        }

@sio.event
async def disconnect(sid):
    for k, v in app.state.user_websocket_sessions.items():
        if v['sid'] == sid:
            app.state.user_websocket_sessions.pop(k)
            return