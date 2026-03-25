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


class TournamentStatusOptionFactory(BaseFactory):
    class Meta:
        model = TournamentStatusOption

    name = factory.Iterator(["Registration Open", "Ongoing", "Finished"])


class TournamentFactory(BaseFactory):
    class Meta:
        model = Tournament

    title = Faker("catch_phrase")
    description = Faker("paragraph")
    start_date = Faker("future_datetime")
    reg_start = Faker("past_datetime")
    reg_end = Faker("future_datetime")
    max_team = Faker("pyint", min_value=10, max_value=100)

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
    telegram_username = factory.Sequence(lambda n: f"@user_{n}")
    educational_institution = Faker("company")
    team = factory.SubFactory(TeamFactory)


class TaskStatusOptionFactory(BaseFactory):
    class Meta:
        model = TaskStatusOption

    name = factory.Iterator(["draft", "active", "finished"])
    display_name = factory.LazyAttribute(lambda f: f.name.upper())


class TaskFactory(BaseFactory):
    class Meta:
        model = Task

    title = Faker("catch_phrase")
    description = Faker("paragraph")
    start_time = Faker("future_datetime")
    end_time = Faker("future_datetime")
    tournament = factory.SubFactory(TournamentFactory)
    status = factory.SubFactory(TaskStatusOptionFactory)


class TaskRequirementCategoryFactory(BaseFactory):
    class Meta:
        model = TaskRequirementCategory

    name = factory.Sequence(lambda n: f"category_{n}")
    display_name = factory.LazyAttribute(lambda f: f.name.upper())


class TaskRequirementOptionFactory(BaseFactory):
    class Meta:
        model = TaskRequirementOption

    name = factory.Sequence(lambda n: f"category_{n}")
    display_name = factory.LazyAttribute(lambda f: f.name.upper())

    category = factory.SubFactory(TaskRequirementCategoryFactory)


class SubmissionFactory(BaseFactory):
    class Meta:
        model = Submission

    team = factory.SubFactory(TeamFactory)


class SubmissionUrlOptionFactory(BaseFactory):
    class Meta:
        model = SubmissionUrlOption

    name = factory.Sequence(lambda n: f"url_option_{n}")
    display_name = factory.LazyAttribute(lambda f: f.name.upper())


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
