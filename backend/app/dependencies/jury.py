from .current_user import CurrentUserDep
from .session import SessionDep
from app.models import User, Task, Tournament
from fastapi import HTTPException, status, Depends
from app.config import settings
from app.utils import get_task, get_tournament

# Permission dependencies
async def get_organizer_or_admin(
    tournament_id: int, current_user: CurrentUserDep, session: SessionDep
) -> User:
    from app.utils import get_tournament

    tournament = await get_tournament(tournament_id, session)
    if tournament.creator_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Permission denied")
    return current_user


async def get_assigned_jury(
    assignment_id: int, current_user: CurrentUserDep, session: SessionDep
) -> User:
    from app.utils import get_assignment

    assignment = await get_assignment(assignment_id, session)
    if assignment.jury_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Permission denied")
    return current_user

async def get_closed_submission_task(task_id: int, session: SessionDep) -> Task:
    task = await get_task(task_id, session)
    if task.status_id != settings.TASK_STATUS_NAMES.SUBMISSION_CLOSED:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="The submissions are still open to be received!",
        )
    return task

async def get_non_finished_tournament(tournament_id: int, session: SessionDep) -> Tournament:
    tournament = await get_tournament(tournament_id, session)
    if tournament.status_id == settings.TOURNAMENT_STATUS_NAMES.FINISHED:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="The tournament has been finished!",
        )
    return tournament

organizer_or_admin_dependency = Depends(get_organizer_or_admin)
assigned_jury_dependency = Depends(get_assigned_jury)
closed_submission_task_dependency = Depends(get_closed_submission_task)
non_finished_tournament_dependency = Depends(get_non_finished_tournament)
