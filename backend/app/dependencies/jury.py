from .current_user import CurrentUserDep
from .session import SessionDep
from app.models import User
from fastapi import HTTPException, status, Depends


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


organizer_or_admin_dependency = Depends(get_organizer_or_admin)
assigned_jury_dependency = Depends(get_assigned_jury)
