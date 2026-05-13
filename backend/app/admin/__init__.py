from sqladmin import Admin, ModelView, action, Flash
from sqladmin import _menu
from sqladmin.authentication import AuthenticationBackend
from fastapi import Request
from fastapi.responses import RedirectResponse
from firebase_admin import auth
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db import engine, AsyncSessionLocal
from app.utils import reject_role_request, approve_role_request
from app.models import (
    JuryAssignment,
    Notification,
    CriterionScore,
    Role,
    RoleRequest,
    Submission,
    SubmissionEvaluation,
    SubmissionUrlOption,
    SubmissionUrl,
    Task,
    TaskEvaluationCriterion,
    TaskRequirementCategory,
    TaskRequirementOption,
    TaskStatusOption,
    Team,
    TeamMember,
    Tournament,
    TournamentStatusOption,
    User,
    News,
    NewsCattegory,
)
from app.config import settings
from app.firebase import firebase
from app.dependencies import get_or_create_user_from_token


class BaseModelView(ModelView):
    form_excluded_columns = ("created_at", "updated_at")


class NamePrimaryKeyAdmin(BaseModelView):
    form_include_pk = True


class UserAdmin(BaseModelView, model=User):
    column_list = [
        User.id,
        User.full_name,
        User.email,
        User.firebase_uid,
        User.created_at,
    ]
    column_searchable_list = [User.full_name, User.email, User.firebase_uid]


class RoleAdmin(NamePrimaryKeyAdmin, model=Role):
    column_list = [Role.name, Role.display_name, Role.description]
    column_searchable_list = [Role.name]


class RoleRequestAdmin(BaseModelView, model=RoleRequest):
    column_list = [RoleRequest.id, RoleRequest.user_id, RoleRequest.role_name]
    list_template = "role_request_list.html"

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
        include_in_schema=True,
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
        include_in_schema=True,
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


class TournamentAdmin(BaseModelView, model=Tournament):
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


class TaskAdmin(BaseModelView, model=Task):
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


class TeamAdmin(BaseModelView, model=Team):
    column_list = [
        Team.id,
        Team.name,
        Team.team_email,
        Team.tournament_id,
        Team.captain_id,
    ]
    column_searchable_list = [Team.name, Team.team_email]


class TeamMemberAdmin(BaseModelView, model=TeamMember):
    column_list = [
        TeamMember.id,
        TeamMember.full_name,
        TeamMember.email,
        TeamMember.telegram,
        TeamMember.educational_institution,
        TeamMember.team_id,
    ]
    column_searchable_list = [
        TeamMember.full_name,
        TeamMember.email,
        TeamMember.telegram,
    ]


class SubmissionAdmin(BaseModelView, model=Submission):
    pass


class SubmissionUrlOptionAdmin(NamePrimaryKeyAdmin, model=SubmissionUrlOption):
    pass


class SubmissionUrlAdmin(BaseModelView, model=SubmissionUrl):
    pass


class SubmissionEvaluationAdmin(BaseModelView, model=SubmissionEvaluation):
    pass


class JuryAssignmentAdmin(BaseModelView, model=JuryAssignment):
    pass


class TaskEvaluationCriterionAdmin(BaseModelView, model=TaskEvaluationCriterion):
    pass


class CriterionScoreAdmin(BaseModelView, model=CriterionScore):
    pass


class NotificationAdmin(BaseModelView, model=Notification):
    column_list = [Notification.id, Notification.user_id, Notification.body]


class NewsCategoryAdmin(NamePrimaryKeyAdmin, model=NewsCattegory):
    pass


class NewsAdmin(BaseModelView, model=News):
    column_list = [News.id, News.is_important, News.body]


class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        id_token = str(form.get("id_token", "")).strip()
        if not id_token:
            return False

        try:
            decoded_token = auth.verify_id_token(id_token, firebase, clock_skew_seconds=10)
            session_cookie = auth.create_session_cookie(
                id_token,
                expires_in=settings.ADMIN_SESSION_EXPIRES,
                app=firebase,
            )
        except Exception:
            return False
        async with AsyncSessionLocal() as session:
            user = await get_or_create_user_from_token(decoded_token, session)
            if not user.is_admin:
                return False

            request.session.update(
                {
                    settings.ADMIN_SESSION_COOKIE_KEY: session_cookie,
                    "admin_user_id": user.id,
                    "admin_user_email": user.email,
                }
            )
            return True

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        session_cookie = request.session.get(settings.ADMIN_SESSION_COOKIE_KEY)
        if not session_cookie:
            return False

        try:
            decoded_claims = auth.verify_session_cookie(
                session_cookie,
                check_revoked=True,
                app=firebase,
                clock_skew_seconds=10,
            )
        except Exception:
            request.session.clear()
            return False
        async with AsyncSessionLocal() as session:
            user = await get_or_create_user_from_token(decoded_claims, session)
            if not user.is_admin:
                request.session.clear()
                return False

            request.state.admin_user = user
            return True


class FrontendItemMenu(_menu.ItemMenu):
    @property
    def type_(self) -> str:
        return "View"

    def url(self, request: Request):
        return settings.FRONTEND_URL


def setup_admin(app):
    authentication_backend = AdminAuth(secret_key=settings.SECRET_KEY)
    admin = Admin(
        app,
        engine,
        AsyncSessionLocal,
        title="Tournament Admin",
        templates_dir="app/admin/templates",
        authentication_backend=authentication_backend,
    )
    admin._menu.add(FrontendItemMenu("Back to frontend", icon="fa-solid fa-house"))
    admin.templates.env.globals["firebase_config"] = {
        "apiKey": settings.VITE_FIREBASE_API_KEY,
        "authDomain": settings.FIREBASE_AUTH_DOMAIN,
        "projectId": settings.FIREBASE_PROJECT_ID,
        "storageBucket": settings.FIREBASE_STORAGE_BUCKET,
        "messagingSenderId": settings.FIREBASE_MESSAGING_SENDER_ID,
        "appId": settings.FIREBASE_APP_ID,
        "measurementId": settings.FIREBASE_MEASUREMENT_ID,
    }
    admin.add_view(UserAdmin)
    admin.add_view(RoleAdmin)
    admin.add_view(RoleRequestAdmin)
    admin.add_view(TournamentAdmin)
    admin.add_view(TournamentStatusOptionAdmin)
    admin.add_view(TaskAdmin)
    admin.add_view(TaskStatusOptionAdmin)
    admin.add_view(TaskEvaluationCriterionAdmin)
    admin.add_view(TaskRequirementCategoryAdmin)
    admin.add_view(TaskRequirementOptionAdmin)
    admin.add_view(TeamAdmin)
    admin.add_view(TeamMemberAdmin)
    admin.add_view(SubmissionAdmin)
    admin.add_view(SubmissionUrlOptionAdmin)
    admin.add_view(SubmissionUrlAdmin)
    admin.add_view(JuryAssignmentAdmin)
    admin.add_view(SubmissionEvaluationAdmin)
    admin.add_view(CriterionScoreAdmin)
    admin.add_view(NotificationAdmin)
    admin.add_view(NewsAdmin)
    admin.add_view(NewsCategoryAdmin)
