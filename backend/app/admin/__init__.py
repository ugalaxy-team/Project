from sqladmin import Admin, ModelView, action, Flash
from fastapi import Request
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db import engine, AsyncSessionLocal
from app.utils.routes import reject_role_request, approve_role_request
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


class NamePrimaryKeyAdmin(ModelView):
    form_include_pk = True


class UserAdmin(ModelView, model=User):
    column_list = [User.id, User.full_name, User.email, User.firebase_uid, User.created_at]
    column_searchable_list = [User.full_name, User.email, User.firebase_uid]


class RoleAdmin(NamePrimaryKeyAdmin, model=Role):
    column_list = [Role.name, Role.display_name, Role.description]
    column_searchable_list = [Role.name]


class RoleRequestAdmin(ModelView, model=RoleRequest):
    column_list = [RoleRequest.id, RoleRequest.user_id, RoleRequest.role_name]
    list_template = 'role_request_list.html'

    async def _get_role_request(self, session, pk: str) -> RoleRequest | None:
        stmt = (
            select(RoleRequest)
            .options(
                selectinload(RoleRequest.user).selectinload(User.roles),
                selectinload(RoleRequest.role),
            )
            .where(RoleRequest.id == int(pk))
        )
        return (await session.execute(stmt)).scalar_one_or_none()

    @action(
        name="reject_request",
        label="Reject",
        confirmation_message="Are you sure?",
        add_in_detail=True,
        add_in_list=True,
        include_in_schema=True
    )
    async def reject_request(self, request: Request):
        pks = request.query_params.get("pks", "").split(",")
        async with self.session_maker() as session:
            for pk in filter(None, pks):
                req = await self._get_role_request(session, pk)
                if req is not None:
                    await reject_role_request(req, session)

        referer = request.headers.get("Referer")
        Flash.success(request, "Role request rejected successfully")
        if referer:
            return RedirectResponse(referer)
        else:
            return RedirectResponse(request.url_for("admin:list", identity=self.identity))

    @action(
        name="approve_request",
        label="Approve",
        confirmation_message="Are you sure?",
        add_in_detail=True,
        add_in_list=True,
        include_in_schema=True
    )
    async def approve_request(self, request: Request):
        pks = request.query_params.get("pks", "").split(",")
        async with self.session_maker() as session:
            for pk in filter(None, pks):
                req = await self._get_role_request(session, pk)
                if req is not None:
                    await approve_role_request(req, session)

        referer = request.headers.get("Referer")
        Flash.success(request, "Role request approved successfully")
        if referer:
            return RedirectResponse(referer)
        else:
            return RedirectResponse(request.url_for("admin:list", identity=self.identity))
        



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


class TournamentStatusOptionAdmin(NamePrimaryKeyAdmin, model=TournamentStatusOption):
    column_list = [TournamentStatusOption.name, TournamentStatusOption.display_name]


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


class TaskStatusOptionAdmin(NamePrimaryKeyAdmin, model=TaskStatusOption):
    column_list = [TaskStatusOption.name, TaskStatusOption.display_name]


class TaskRequirementCategoryAdmin(NamePrimaryKeyAdmin, model=TaskRequirementCategory):
    pass


class TaskRequirementOptionAdmin(NamePrimaryKeyAdmin, model=TaskRequirementOption):
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


class SubmissionUrlOptionAdmin(NamePrimaryKeyAdmin, model=SubmissionUrlOption):
    pass


class SubmissionEvaluationAdmin(ModelView, model=SubmissionEvaluation):
    pass


class RequirementEvaluationAdmin(ModelView, model=RequirementEvaluation):
    pass


class NotificationAdmin(ModelView, model=Notification):
    column_list = [Notification.id, Notification.user_id, Notification.body]


def setup_admin(app):
    admin = Admin(app, engine, AsyncSessionLocal, title="Tournament Admin", templates_dir='app/admin/templates')
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
