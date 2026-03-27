from fastapi import FastAPI
import app.routes.tournaments as tournaments
import app.routes.users as users
import app.routes.profile as profile
import app.routes.tasks as tasks
import app.routes.submissions as submissions
import app.routes.teams as teams
import app.routes.team_members as team_members
import app.routes.tournament_teams as tournament_teams


app = FastAPI()
app.include_router(tournaments.router)
app.include_router(users.router)
app.include_router(profile.router)
app.include_router(tasks.router)
app.include_router(submissions.router)
app.include_router(teams.router)
app.include_router(team_members.router)
app.include_router(tournament_teams.router)
