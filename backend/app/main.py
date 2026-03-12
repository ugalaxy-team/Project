from fastapi import FastAPI
import app.routes.tournaments as tournaments
import app.routes.users as users
import app.routes.profile as profile
import backend.app.routes.role_requests as role_requests

app = FastAPI()
app.include_router(tournaments.router)
app.include_router(users.router)
app.include_router(profile.router)
app.include_router(role_requests.router)
