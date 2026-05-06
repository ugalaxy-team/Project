import os
import json

from pathlib import Path
from types import SimpleNamespace
from typing import Any
from pydantic import AliasChoices, BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from datetime import timedelta

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


class CategoryConfig(BaseModel):
    name: str
    main_id: str | None = None


class NewsCategoryConfig(OptionConfig):
    categoryColor: str


class SharedAppConfig(BaseModel):
    roles: list[RoleConfig]
    tournament_statuses: list[OptionConfig]
    task_statuses: list[OptionConfig]
    categories: list[CategoryConfig]
    role_request_options: list[OptionConfig]
    news_categories: list[NewsCategoryConfig]


def load_shared_app_config() -> SharedAppConfig:
    with SHARED_CONFIG_PATH.open("r", encoding="utf-8") as config_file:
        return SharedAppConfig.model_validate(json.load(config_file))


def option_names(options: list[Any]) -> SimpleNamespace:
    return SimpleNamespace(
        **{option.name.upper().replace("&", "AND"): option.name for option in options}
    )


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ENV_PATH, extra="ignore")

    SECRET_KEY: str = os.getenv("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI: str = os.getenv("SQLALCHEMY_DATABASE_URI")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL")
    FIREBASE_CERT_PATH: str = str(Path(BACKEND_DIR, "app", "serviceAccountKey.json"))
    VITE_FIREBASE_API_KEY: str = Field(validation_alias="VITE_FIREBASE_API_KEY")
    FIREBASE_AUTH_DOMAIN: str = Field(
        validation_alias=AliasChoices("FIREBASE_AUTH_DOMAIN", "VITE_FIREBASE_AUTH_DOMAIN"),
    )
    FIREBASE_PROJECT_ID: str = Field(
        validation_alias=AliasChoices("FIREBASE_PROJECT_ID", "VITE_FIREBASE_PROJECT_ID"),
    )
    FIREBASE_STORAGE_BUCKET: str = Field(
        validation_alias=AliasChoices(
            "FIREBASE_STORAGE_BUCKET", "VITE_FIREBASE_STORAGE_BUCKET"
        ),
    )
    FIREBASE_MESSAGING_SENDER_ID: str = Field(
        validation_alias=AliasChoices(
            "FIREBASE_MESSAGING_SENDER_ID", "VITE_FIREBASE_MESSAGING_SENDER_ID"
        ),
    )
    FIREBASE_APP_ID: str = Field(
        validation_alias=AliasChoices("FIREBASE_APP_ID", "VITE_FIREBASE_APP_ID"),
    )
    FIREBASE_MEASUREMENT_ID: str = Field(
        validation_alias=AliasChoices(
            "FIREBASE_MEASUREMENT_ID", "VITE_FIREBASE_MEASUREMENT_ID"
        ),
    )

    ADMIN_SESSION_COOKIE_KEY: str = "admin_session_cookie"
    ADMIN_SESSION_EXPIRES: timedelta = timedelta(days=5)
    CHARACTERS_PER_MINUTE: int = 200

    # TODO: Move this to a config file
    CORS_ORIGINS: list[str] = [
        "http://localhost",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
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
        return [status.model_dump() for status in self.SHARED_APP_CONFIG.tournament_statuses]

    @property
    def TASK_STATUS_OPTIONS(self) -> list[dict[str, Any]]:
        return [status.model_dump() for status in self.SHARED_APP_CONFIG.task_statuses]

    @property
    def NEWS_CATEGORY_OPTIONS(self) -> list[dict[str, Any]]:
        return [
            {
                "name": category.name,
                "display_name": category.display_name,
            }
            for category in self.SHARED_APP_CONFIG.news_categories
        ]

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

    @property
    def ROLE_REQUEST_OPTION_NAMES(self) -> SimpleNamespace:
        return option_names(self.SHARED_APP_CONFIG.role_request_options)

    @property
    def ROLE_REQUEST_INFO_OPTIONS(self) -> list[dict[str, Any]]:
        return [opt.model_dump() for opt in self.SHARED_APP_CONFIG.role_request_options]

    @property
    def TASK_CATEGORIES(self) -> SimpleNamespace:
        return option_names(self.SHARED_APP_CONFIG.categories)

    @property
    def CATEGORY_LIST(self) -> list[dict[str, Any]]:
        return [cat.model_dump() for cat in self.SHARED_APP_CONFIG.categories]

    def NEWS_CATEGORY_NAMES(self) -> SimpleNamespace:
        return option_names(self.SHARED_APP_CONFIG.news_categories)


settings = Settings()
