from fastapi import FastAPI
import app.routes.tournaments as tournaments
import app.routes.users as users

app = FastAPI()
app.include_router(tournaments.router)
app.include_router(users.router)