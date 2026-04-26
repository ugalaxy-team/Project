import factory
from factory.faker import Faker
from factory.alchemy import SQLAlchemyModelFactory

from app.models import (
    User,
    Role,
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
    SubmissionEvaluation,
    RequirementEvaluation,
    Notification,
    RoleRequest,
)


class BaseFactory(SQLAlchemyModelFactory):
    class Meta:
        abstract = True
        sqlalchemy_session = None
        sqlalchemy_session_persistence = None

class BaseOptionFactory(BaseFactory):
    class Meta:
        abstract = True

    name = Faker('name')
    display_name = factory.LazyAttribute(lambda f: f.name.upper())

class UserFactory(BaseFactory):
    class Meta:
        model = User

    firebase_uid = Faker('uuid4')
    full_name = Faker("name")
    email = factory.Sequence(lambda n: f"user{n}@example.com")

class RoleFactory(BaseFactory):
    class Meta:
        model = Role

    name = factory.Iterator(["admin", "user", "jury"])
    display_name = factory.Iterator(["Admin", "User", "Jury"])
    description = factory.Iterator('Test role')


class TournamentStatusOptionFactory(BaseOptionFactory):
    class Meta:
        model = TournamentStatusOption


class TournamentFactory(BaseFactory):
    class Meta:
        model = Tournament

    title = Faker("catch_phrase")
    description = Faker("paragraph")
    start_date = Faker("future_datetime")
    reg_start = Faker("past_datetime")
    reg_end = Faker("future_datetime")
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
    contact_info = Faker("phone_number")

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

    name = factory.Iterator(["draft", "active", "finished"])

class TaskFactory(BaseFactory):
    class Meta:
        model = Task

    title = Faker("catch_phrase")
    description = Faker("paragraph")
    start_time = Faker("future_datetime")
    end_time = Faker("future_datetime")
    tournament = factory.SubFactory(TournamentFactory)
    status_id = factory.Iterator(["draft", "active", "finished"])

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


class SubmissionUrlOptionFactory(BaseOptionFactory):
    class Meta:
        model = SubmissionUrlOption

    name = factory.Sequence(lambda n: f"url_option_{n}")


class SubmissionUrlFactory(BaseFactory):
    class Meta:
        model = SubmissionUrl

    submission = factory.SubFactory(SubmissionFactory)
    url = factory.SubFactory(SubmissionUrlOptionFactory)


class SubmissionEvaluationFactory(BaseFactory):
    class Meta:
        model = SubmissionEvaluation

    submission = factory.SubFactory(SubmissionFactory)
    jury = factory.SubFactory(UserFactory)


class RequirementEvaluationFactory(BaseFactory):
    class Meta:
        model = RequirementEvaluation

    evaluation = factory.SubFactory(SubmissionEvaluationFactory)
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
