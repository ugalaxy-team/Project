from sqlalchemy import create_engine
from sqladmin import Admin, ModelView
from app.db import engine, AsyncSessionLocal

from app.models import (
    Notification,
    RequirementEvaluation,
    Role,
    RoleRequest,
    Submission,
    SubmissionEvaluation,
    SubmissionUrlOption,
    Task,
    TaskRequirementCategory,
    TaskRequirementOption,
    TaskStatusOption,
    Team,
    TeamMember,
    Tournament,
    TournamentStatusOption,
    User,
)


class UserAdmin(ModelView, model=User):
    column_list = [User.id, User.full_name, User.email, User.firebase_uid, User.created_at]
    column_searchable_list = [User.full_name, User.email, User.firebase_uid]


class RoleAdmin(ModelView, model=Role):
    column_list = [Role.name, Role.name]
    column_searchable_list = [Role.name]


class RoleRequestAdmin(ModelView, model=RoleRequest):
    column_list = [RoleRequest.id, RoleRequest.user_id, RoleRequest.role_name]


class TournamentAdmin(ModelView, model=Tournament):
    column_list = [
        Tournament.id,
        Tournament.title,
        Tournament.start_date,
        Tournament.reg_start,
        Tournament.reg_end,
        Tournament.max_teams,
        Tournament.status_id,
        Tournament.creator_id,
    ]
    column_searchable_list = [Tournament.title]


class TournamentStatusOptionAdmin(ModelView, model=TournamentStatusOption):
    column_list = [TournamentStatusOption.id, TournamentStatusOption.name, TournamentStatusOption.display_name]


class TaskAdmin(ModelView, model=Task):
    column_list = [
        Task.id,
        Task.title,
        Task.tournament_id,
        Task.start_time,
        Task.end_time,
        Task.status_id,
    ]
    column_searchable_list = [Task.title]


class TaskStatusOptionAdmin(ModelView, model=TaskStatusOption):
    pass


class TaskRequirementCategoryAdmin(ModelView, model=TaskRequirementCategory):
    pass


class TaskRequirementOptionAdmin(ModelView, model=TaskRequirementOption):
    pass


class TeamAdmin(ModelView, model=Team):
    column_list = [
        Team.id,
        Team.name,
        Team.team_email,
        Team.tournament_id,
        Team.captain_id,
    ]
    column_searchable_list = [Team.name, Team.team_email]


class TeamMemberAdmin(ModelView, model=TeamMember):
    column_list = [
        TeamMember.id,
        TeamMember.full_name,
        TeamMember.email,
        TeamMember.telegram,
        TeamMember.educational_institution,
        TeamMember.team_id,
    ]
    column_searchable_list = [TeamMember.full_name, TeamMember.email, TeamMember.telegram]


class SubmissionAdmin(ModelView, model=Submission):
    pass


class SubmissionUrlOptionAdmin(ModelView, model=SubmissionUrlOption):
    pass


class SubmissionEvaluationAdmin(ModelView, model=SubmissionEvaluation):
    pass


class RequirementEvaluationAdmin(ModelView, model=RequirementEvaluation):
    pass


class NotificationAdmin(ModelView, model=Notification):
    column_list = [Notification.id, Notification.user_id, Notification.body]


def setup_admin(app):
    admin = Admin(app, engine, AsyncSessionLocal, title="Tournament Admin")
    admin.add_view(UserAdmin)
    admin.add_view(RoleAdmin)
    admin.add_view(RoleRequestAdmin)
    admin.add_view(TournamentAdmin)
    admin.add_view(TournamentStatusOptionAdmin)
    admin.add_view(TaskAdmin)
    admin.add_view(TaskStatusOptionAdmin)
    admin.add_view(TaskRequirementCategoryAdmin)
    admin.add_view(TaskRequirementOptionAdmin)
    admin.add_view(TeamAdmin)
    admin.add_view(TeamMemberAdmin)
    admin.add_view(SubmissionAdmin)
    admin.add_view(SubmissionUrlOptionAdmin)
    admin.add_view(SubmissionEvaluationAdmin)
    admin.add_view(RequirementEvaluationAdmin)
    admin.add_view(NotificationAdmin)