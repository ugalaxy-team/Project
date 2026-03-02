from fastapi import FastAPI
import app.routes.tournaments as tournaments

app = FastAPI()
app.include_router(tournaments.router)