from datetime import datetime, timezone
from fastapi import status, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload


from app.dependencies import SessionDep
from app.models import Team, TeamMember, Tournament
from app.schemas import TeamModel


async def get_tournament(tournament_id: int, session: SessionDep) -> Tournament:
    tournament = await session.get(Tournament, tournament_id)

    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found",
        )

    return tournament


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
    if teams_count >= tournament.max_team:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Tournament is full")

    all_emails = [team_data.captain.email] + [m.email for m in team_data.members]
    if len(all_emails) != len(set(all_emails)):
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Emails must be unique inside team"
        )


async def create_team_record(
    tournament_id: int, team_data: TeamModel, session: AsyncSession
) -> Team:

    new_team = Team(
        name=team_data.name,
        team_email=team_data.team_email,
        contact_info=str(team_data.contact_info),
        tournament_id=tournament_id,
    )
    session.add(new_team)
    await session.flush()

    captain = TeamMember(
        **team_data.captain.model_dump(),
        team_id=new_team.id,
    )
    session.add(captain)
    await session.flush()

    members = [
        TeamMember(**m.model_dump(), team_id=new_team.id) for m in team_data.members
    ]
    session.add_all(members)

    new_team.captain_id = captain.id

    return new_team
