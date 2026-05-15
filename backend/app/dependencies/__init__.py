from .session import SessionDep, get_session
from .admin_user import AdminUserDep, get_admin_user
from .current_user import (
    CurrentUserDep,
    UserDep,
    get_current_user,
    get_user,
    get_or_create_user_from_token,
    current_user_dependency,
)
from .role_request import RoleRequestDep, get_role_request
from .permissions import TournamentOwnerDep, TaskOwnerDep, TeamOwnerDep, task_owner_dependency, team_owner_dependency, tournament_owner_dependency
from .jury import organizer_or_admin_dependency, assigned_jury_dependency, closed_submission_task_dependency,\
get_assigned_jury, get_organizer_or_admin, get_closed_submission_task, non_finished_tournament_dependency, get_non_finished_tournament