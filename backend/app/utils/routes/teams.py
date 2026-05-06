from datetime import datetime, timezone
from fastapi import status, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload


from app.dependencies import SessionDep
from app.models import Team, Tournament
from app.schemas import TeamModel


def check_registration_open(tournament: Tournament):
    now = datetime.now(timezone.utc)

    reg_start = tournament.reg_start.replace(tzinfo=timezone.utc)
    reg_end = tournament.reg_end.replace(tzinfo=timezone.utc)

    if not (reg_start <= now <= reg_end):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration is closed",
        )


async def get_team(team_id: int, tournament_id: int, session: SessionDep) -> Team:
    statement = (
        select(Team)
        .where(
            Team.id == team_id,
            Team.tournament_id == tournament_id,
        )
        .options(
            selectinload(Team.members),
            selectinload(Team.captain),
        )
    )

    result = await session.execute(statement)
    team = result.scalar_one_or_none()

    if not team:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail="Team not found!",
        )

    return team


async def validate_team_registration(
    tournament: Tournament, team_data: TeamModel, session: AsyncSession
):

    count_stmt = select(func.count()).where(Team.tournament_id == tournament.id)
    teams_count = (await session.execute(count_stmt)).scalar()
    if teams_count >= tournament.max_teams:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Tournament is full")

    all_emails = [team_data.captain.email] + [m.email for m in team_data.members]
    if len(all_emails) != len(set(all_emails)):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Emails must be unique inside team")
