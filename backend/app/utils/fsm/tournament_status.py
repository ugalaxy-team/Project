from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy import select


from app.config import settings
from app.dependencies.session import SessionDep
from app.models import Tournament, TournamentStatusOption
from statemachine import StateMachine, State


class TournamentStatus(StateMachine):
    draft = State("Draft", value=settings.TOURNAMENT_STATUS_NAMES.DRAFT, initial=True)
    registration = State("Registration", value=settings.TOURNAMENT_STATUS_NAMES.REGISTRATION)
    running = State("Running", value=settings.TOURNAMENT_STATUS_NAMES.RUNNING)
    finished = State("Finished", value=settings.TOURNAMENT_STATUS_NAMES.FINISHED, final=True)

    start_registration = draft.to(registration)
    start_tournament = registration.to(running)
    finish_tournament = running.to(finished)

    def __init__(self, tournament: Tournament, session):
        self.tournament = tournament
        self.session = session
        self.tournament.status_name = tournament.status.name

        super().__init__(model=self.tournament, state_field="status_name")

    async def update_db_status(self):

        new_status_name = self.current_state.value

        statement = select(TournamentStatusOption).where(
            TournamentStatusOption.name == new_status_name
        )
        result = await self.session.execute(statement)
        status_option = result.scalar_one()

        self.tournament.status_id = status_option.name
        self.tournament.status = status_option

        await self.session.commit()


async def auto_update_tournament_status(tournament: Tournament, session):
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    fsm = TournamentStatus(tournament, session)
    initial_state_value = fsm.current_state.value

    if fsm.current_state == TournamentStatus.draft:
        if tournament.reg_start <= now:
            fsm.start_registration()

    if fsm.current_state == TournamentStatus.registration:
        if tournament.reg_end <= now:
            fsm.start_tournament()

    if fsm.current_state.value != initial_state_value:
        await fsm.update_db_status()

        await session.refresh(tournament, ["status"])


async def get_status_by_name(name: str, session: SessionDep) -> TournamentStatusOption:
    statement = select(TournamentStatusOption).where(
        TournamentStatusOption.name == name
    )
    status_ = (await session.execute(statement)).scalar_one_or_none()

    if not status_:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)

    return status_
