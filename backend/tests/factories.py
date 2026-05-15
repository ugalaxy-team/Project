import factory
import factory.fuzzy
from factory.faker import Faker
from factory.alchemy import SQLAlchemyModelFactory

from app.config import settings
from app.models import (
    User,
    Role,
    News,
    NewsCattegory,
    TeamMember,
    Team,
    Tournament,
    TournamentStatusOption,
    Task,
    TaskStatusOption,
    TaskRequirementOption,
    TaskRequirementCategory,
    Submission,
    SubmissionUrl,
    SubmissionUrlOption,
    JuryAssignment,
    JuryAssignmentStatusOption,
    SubmissionEvaluation,
    Notification,
    RoleRequest,
    TaskEvaluationCriterion,
    CriterionScore,
)
import datetime


class BaseFactory(SQLAlchemyModelFactory):
    class Meta:
        abstract = True
        sqlalchemy_session = None
        sqlalchemy_session_persistence = None


class BaseOptionFactory(BaseFactory):
    class Meta:
        abstract = True
        sqlalchemy_get_or_create = ('name',)

    name = Faker("name")
    display_name = factory.LazyAttribute(lambda f: f.name.upper())


class BaseDatetimeFactory(BaseFactory):
    class Meta:
        abstract = True

    created_at = factory.Faker("date_time")
    updated_at = factory.LazyAttribute(lambda o: o.created_at + datetime.timedelta(hours=1))


class UserFactory(BaseFactory):
    class Meta:
        model = User

    firebase_uid = Faker("uuid4")
    full_name = Faker("name")
    email = factory.Sequence(lambda n: f"user{n}@example.com")


class RoleFactory(BaseFactory):
    class Meta:
        model = Role

    name = factory.Iterator([option["name"] for option in settings.ROLE_OPTIONS])
    display_name = factory.LazyAttribute(
        lambda role: next(
            option["display_name"]
            for option in settings.ROLE_OPTIONS
            if option["name"] == role.name
        )
    )
    description = factory.LazyAttribute(
        lambda role: next(
            option["description"]
            for option in settings.ROLE_OPTIONS
            if option["name"] == role.name
        )
    )


class TournamentStatusOptionFactory(BaseOptionFactory):
    class Meta:
        model = TournamentStatusOption
        sqlalchemy_get_or_create = ('name',)

    name = factory.Iterator(list(settings.TOURNAMENT_STATUS_NAMES.__dict__.values()))


class NewsCattegoryFactory(BaseOptionFactory):
    class Meta:
        model = NewsCattegory

    name = factory.Iterator([option["name"] for option in settings.NEWS_CATEGORY_OPTIONS])
    display_name = factory.LazyAttribute(
        lambda category: next(
            option["display_name"]
            for option in settings.NEWS_CATEGORY_OPTIONS
            if option["name"] == category.name
        )
    )


class NewsFactory(BaseFactory):
    class Meta:
        model = News

    title = factory.Sequence(lambda n: f"news_{n} title")
    excerpt = factory.Sequence(lambda n: f"news_{n} excerpt")
    body = factory.Sequence(lambda n: f"news_{n} body")
    category = factory.SubFactory(NewsCattegoryFactory)
    is_important = False


class TournamentFactory(BaseFactory):
    class Meta:
        model = Tournament

    title = Faker("catch_phrase")
    description = Faker("paragraph")
    start_date = factory.LazyAttribute(
        lambda o: o.reg_end + datetime.timedelta(days=factory.fuzzy.FuzzyInteger(1, 10).fuzz())
    )
    reg_start = Faker("future_datetime", end_date="+30d")
    reg_end = factory.LazyAttribute(
        lambda o: (
            o.reg_start + datetime.timedelta(days=factory.fuzzy.FuzzyInteger(1, 10).fuzz())
        )
    )
    max_teams = Faker("pyint", min_value=10, max_value=100)
    min_people_in_team = Faker("pyint", min_value=1, max_value=100)
    max_people_in_team = Faker("pyint", min_value=1, max_value=100)

    creator = factory.SubFactory(UserFactory)
    status = factory.SubFactory(TournamentStatusOptionFactory)


class TeamFactory(BaseFactory):
    class Meta:
        model = Team

    name = Faker("name")
    team_email = Faker("email")
    contact_info = Faker("numerify", text="+38050#######")

    tournament = factory.SubFactory(TournamentFactory)
    captain = None

    @classmethod
    def with_captain(cls, **kwargs):
        team = cls.build(**kwargs)
        captain = TeamMemberFactory.build(team=team)
        team.captain = captain
        return team, captain


class TeamMemberFactory(BaseFactory):
    class Meta:
        model = TeamMember

    full_name = Faker("name")
    email = Faker("email")
    telegram = factory.Sequence(lambda n: f"@user_{n}")
    educational_institution = Faker("company")
    team = factory.SubFactory(TeamFactory)
    tournament = factory.SubFactory(TournamentFactory)


class TaskStatusOptionFactory(BaseOptionFactory):
    class Meta:
        model = TaskStatusOption

    name = factory.Iterator([option["name"] for option in settings.TASK_STATUS_OPTIONS])
    display_name = factory.LazyAttribute(
        lambda status: next(
            option["display_name"]
            for option in settings.TASK_STATUS_OPTIONS
            if option["name"] == status.name
        )
    )


class JuryAssignmentStatusOptionFactory(BaseOptionFactory):
    class Meta:
        model = JuryAssignmentStatusOption

    name = factory.Iterator(
        [option["name"] for option in settings.JURY_ASSIGNMENT_STATUS_OPTIONS]
    )
    display_name = factory.LazyAttribute(
        lambda status: next(
            option["display_name"]
            for option in settings.JURY_ASSIGNMENT_STATUS_OPTIONS
            if option["name"] == status.name
        )
    )


class TaskFactory(BaseFactory):
    class Meta:
        model = Task

    title = Faker("catch_phrase")
    description = Faker("paragraph")
    start_time = Faker("future_datetime")
    end_time = Faker("future_datetime")
    tournament = factory.SubFactory(TournamentFactory)
    status_id = factory.Iterator([option["name"] for option in settings.TASK_STATUS_OPTIONS])
    min_reviews_per_submission = 2
    max_score = 10
    is_leaderboard_visible = True

    @classmethod
    def _adjust_kwargs(cls, **kwargs):
        status_id = kwargs.get("status_id")
        if isinstance(status_id, TaskStatusOption):
            kwargs["status"] = status_id
            kwargs.pop("status_id")
        return super()._adjust_kwargs(**kwargs)


class TaskRequirementCategoryFactory(BaseOptionFactory):
    class Meta:
        model = TaskRequirementCategory


class TaskRequirementOptionFactory(BaseOptionFactory):
    class Meta:
        model = TaskRequirementOption

    category = factory.SubFactory(TaskRequirementCategoryFactory)


class SubmissionFactory(BaseFactory):
    class Meta:
        model = Submission

    team = factory.SubFactory(TeamFactory)
    task = factory.LazyAttribute(lambda obj: TaskFactory.build(tournament=obj.team.tournament))


class SubmissionUrlOptionFactory(BaseOptionFactory):
    class Meta:
        model = SubmissionUrlOption

    name = factory.Sequence(lambda n: f"url_option_{n}")


class SubmissionUrlFactory(BaseFactory):
    class Meta:
        model = SubmissionUrl

    submission = factory.SubFactory(SubmissionFactory)
    url = factory.SubFactory(SubmissionUrlOptionFactory)
    value = factory.Sequence(lambda n: f"https://example.com/submission/{n}")


class TaskEvaluationCriterionFactory(BaseFactory):
    class Meta:
        model = TaskEvaluationCriterion

    task = factory.SubFactory(TaskFactory)
    name = factory.Sequence(lambda n: f"Criterion {n}")
    description = None
    weight = 1
    max_score = 10


class JuryAssignmentFactory(BaseDatetimeFactory):
    class Meta:
        model = JuryAssignment

    submission = factory.SubFactory(SubmissionFactory)
    task = factory.SelfAttribute("submission.task")
    jury = factory.SubFactory(UserFactory)
    status = factory.SubFactory(JuryAssignmentStatusOptionFactory)

    @classmethod
    def _adjust_kwargs(cls, **kwargs):
        status_id = kwargs.get("status_id")
        if isinstance(status_id, JuryAssignmentStatusOption):
            kwargs["status"] = status_id
            kwargs.pop("status_id")
        return super()._adjust_kwargs(**kwargs)


class SubmissionEvaluationFactory(BaseFactory):
    class Meta:
        model = SubmissionEvaluation

    assignment = factory.SubFactory(JuryAssignmentFactory)
    submission = factory.SelfAttribute("assignment.submission")
    jury = factory.SelfAttribute("assignment.jury")
    comment = None


class CriterionScoreFactory(BaseFactory):
    class Meta:
        model = CriterionScore

    evaluation = factory.SubFactory(SubmissionEvaluationFactory)
    criterion = factory.SubFactory(TaskEvaluationCriterionFactory)
    score = factory.Faker("pyint", min_value=0, max_value=100)


class NotificationFactory(BaseFactory):
    class Meta:
        model = Notification

    body = factory.Sequence(lambda n: f"notification_{n}")
    user = factory.SubFactory(UserFactory)


class RoleRequestFactory(BaseFactory):
    class Meta:
        model = RoleRequest

    role = factory.SubFactory(RoleFactory)
    user = factory.SubFactory(UserFactory)
