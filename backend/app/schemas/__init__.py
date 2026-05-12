from .evaluation import (
    CriterionScoreCreate,
    CriterionScorePublic,
    EvaluationLeaderboardEntry,
    FinishEvaluationResponse,
    JuryAssignmentPublic,
    JuryAssignmentPublic,
    SubmissionEvaluationCreate,
    SubmissionEvaluationPublic,
    SubmissionEvaluationUpdate
)
from .news import NewsPublic
from .notification import NotificationPublic, NotificationCreate
from .option import OptionPublic, OptionUpdate
from .role_request import RoleRequestPublic, RoleRequestCreate
from .role import RoleCreate, RolePublic, RoleUpdate
from .submission import (
    SubmissionCreateUrl,
    SubmissionCreate,
    SubmissionModel,
    SubmissionPublic,
    SubmissionUrlModel,
)
from .task_options import TaskRequirementOptionCreate, TaskRequirementOptionPublic
from .task import (
    TaskBase,
    TaskCreate,
    TaskEvaluationCategoryCreate,
    TaskEvaluationCategoryPublic,
    TaskEvaluationCriterionCreate,
    TaskEvaluationCriterionPublic,
    TaskPublic,
    TaskUpdate,
)
from .team import (
    TeamModel,
    TeamPublic,
    TeamUpdate,
    TeamMemberCreate,
    TeamMemberPublic,
    TeamMemberUpdate,
)
from .tournament import (
    TournamentBase,
    TournamentUpdate,
    TournamentCreate,
    TournamentPublic,
    TournamentStatusOptionModel,
    TournamentPublicMinimal
)
from .user import UserModel, UserPublic, UserUpdate, UserCreate, CurrentUser, UserMinimalPublic

UserPublic.model_rebuild()
CurrentUser.model_rebuild()
TeamPublic.model_rebuild()
TournamentCreate.model_rebuild()
TournamentUpdate.model_rebuild()
TournamentPublic.model_rebuild()
TournamentPublicMinimal.model_rebuild()
