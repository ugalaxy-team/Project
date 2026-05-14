from fastapi import Depends, HTTPException, status, Request
from typing import Annotated

from app.models import Tournament, Task, Team
from app.utils import get_tournament, get_task, get_team
from .session import SessionDep
from .current_user import CurrentUserDep


class OwnershipChecker:
    def __init__(
        self,
        object_getter: callable,
        path_param: str,
        tournament_id_resolver: callable = None,
    ):
        self.object_getter = object_getter
        self.path_param = path_param
        self.tournament_id_resolver = tournament_id_resolver or (lambda obj: obj.id)

    async def __call__(
        self,
        current_user: CurrentUserDep,
        session: SessionDep,
        request: Request,
    ):
        object_id = request.path_params.get(self.path_param)

        if object_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Path parameter '{self.path_param}' not found",
            )

        obj = await self.object_getter(int(object_id), session)

        if isinstance(obj, Tournament):
            tournament = obj
        else:
            t_id = self.tournament_id_resolver(obj)
            tournament = await get_tournament(t_id, session)

        if tournament.creator_id != current_user.id and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )

        return obj


TournamentOwnerDep = Annotated[
    Tournament,
    Depends(OwnershipChecker(get_tournament, path_param="tournament_id")),
]

TaskOwnerDep = Annotated[
    Task,
    Depends(
        OwnershipChecker(
            get_task,
            path_param="task_id",
            tournament_id_resolver=lambda t: t.tournament_id,
        )
    ),
]

TeamOwnerDep = Annotated[
    Team,
    Depends(
        OwnershipChecker(
            get_team,
            path_param="team_id",
            tournament_id_resolver=lambda t: t.tournament_id,
        )
    ),
]
