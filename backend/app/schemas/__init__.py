from .evaluation import RequirementEvaluationModel, SubmissionEvaluationModel
from .submission import SubmissionUrlOptionModel, SubmissionUrlModel, SubmissionModel
from .task_options import TaskRequirementOptionCreate, TaskRequirementOptionPublic
from .task import TaskBase, TaskCreate, TaskUpdate, TaskPublic
from .team import TeamModel, TeamPublic, TeamUpdate, TeamMemberCreate, TeamMemberPublic, TeamMemberUpdate
from .tournament import (
    TournamentBase,
    TournamentUpdate,
    TournamentCreate,
    TournamentPublic,
    TournamentStatusOptionModel,
)
from .user import UserModel, UserPublic, UserUpdate, UserCreate, CurrentUser
from .role_request import RoleRequestPublic, RoleRequestCreate
from .role import RoleCreate, RolePublic, RoleUpdate
from .notification import NotificationPublic, NotificationCreate

UserPublic.model_rebuild()
CurrentUser.model_rebuild()
TeamPublic.model_rebuild()
TournamentPublic.model_rebuild()
