from pydantic_settings import BaseSettings, SettingsConfigDict
import os


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file="../.env")
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI: str = os.getenv("SQLALCHEMY_DATABASE_URI")
    ROLE_REQUEST_NOTIFICATION_MESSAGE = '''
    A user $user requested a role $role. Do you approve this request?
    '''
    ROLE_REQUEST_APPROVED_MESSAGE = '''
    Your role request was approved. The role $role was granted to you!
    '''
    ROLE_REQUEST_DIS_MESSAGE = '''
    Your role request was approved. You were not granted the role $role
    '''


settings = Settings()
