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
    TaskRequirementCategory,
    TaskRequirementOption,
)


class BaseFactory(SQLAlchemyModelFactory):
    class Meta:
        abstract = True
        sqlalchemy_session = None
        sqlalchemy_session_persistence = None


class UserFactory(BaseFactory):
    class Meta:
        model = User

    full_name = Faker("name")
    email = "test@example.com"
    password = "very_strong_password"


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
