import os
import json

from pathlib import Path
from types import SimpleNamespace
from typing import Any
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent
BASE_DIR = BACKEND_DIR.parent
ENV_PATH = Path(BASE_DIR, ".env")
SHARED_CONFIG_PATH = Path(BASE_DIR, "shared", "app_config.json")


class RoleConfig(BaseModel):
    name: str
    display_name: str
    description: str


class OptionConfig(BaseModel):
    name: str
    display_name: str


class SharedAppConfig(BaseModel):
    roles: list[RoleConfig]
    tournament_statuses: list[OptionConfig]
    task_statuses: list[OptionConfig]


def load_shared_app_config() -> SharedAppConfig:
    with SHARED_CONFIG_PATH.open("r", encoding="utf-8") as config_file:
        return SharedAppConfig.model_validate(json.load(config_file))


def option_names(options: list[RoleConfig] | list[OptionConfig]) -> SimpleNamespace:
    return SimpleNamespace(**{option.name.upper(): option.name for option in options})


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ENV_PATH, extra="ignore")

    SECRET_KEY: str = os.getenv("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI: str = os.getenv("SQLALCHEMY_DATABASE_URI")
    FIREBASE_CERT_PATH: str = str(Path(BACKEND_DIR, "app", "serviceAccountKey.json"))

    # TODO: Move this to a config file
    CORS_ORIGINS: list[str] = [
        "http://localhost",
        "http://localhost:5173",
    ]
    ROLE_REQUEST_NOTIFICATION_MESSAGE: str = """
    A user $user requested a role $role. Do you approve this request?
    """
    ROLE_REQUEST_APPROVED_MESSAGE: str = """
    Your role request was approved. The role $role was granted to you!
    """
    ROLE_REQUEST_REJECTED_MESSAGE: str = """
    Your role request was rejected. You were not granted the role $role
    """
    SHARED_APP_CONFIG: SharedAppConfig = Field(default_factory=load_shared_app_config)

    @property
    def ROLE_OPTIONS(self) -> list[dict[str, Any]]:
        return [role.model_dump() for role in self.SHARED_APP_CONFIG.roles]

    @property
    def TOURNAMENT_STATUS_OPTIONS(self) -> list[dict[str, Any]]:
        return [
            status.model_dump() for status in self.SHARED_APP_CONFIG.tournament_statuses
        ]

    @property
    def TASK_STATUS_OPTIONS(self) -> list[dict[str, Any]]:
        return [status.model_dump() for status in self.SHARED_APP_CONFIG.task_statuses]

    @property
    def ROLE_NAMES(self) -> SimpleNamespace:
        return option_names(self.SHARED_APP_CONFIG.roles)

    @property
    def TOURNAMENT_STATUS_NAMES(self) -> SimpleNamespace:
        return option_names(self.SHARED_APP_CONFIG.tournament_statuses)

    @property
    def TASK_STATUS_NAMES(self) -> SimpleNamespace:
        return option_names(self.SHARED_APP_CONFIG.task_statuses)

    @property
    def TOURNAMENT_CREATOR_ROLES(self) -> list[str]:
        return [self.ROLE_NAMES.ADMIN, self.ROLE_NAMES.ORGANIZER]


settings = Settings()
