import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra='ignore')

    SECRET_KEY: str = os.getenv("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI: str = os.getenv("SQLALCHEMY_DATABASE_URI")
    FIREBASE_CERT_PATH: str = str(BASE_DIR / "serviceAccountKey.json")
    
    # TODO: Move this to a config file
    CORS_ORIGINS: list[str] = [
        "http://localhost",
        "http://localhost:5173",
    ]
    ROLE_REQUEST_NOTIFICATION_MESSAGE: str = '''
    A user $user requested a role $role. Do you approve this request?
    '''
    ROLE_REQUEST_APPROVED_MESSAGE: str = '''
    Your role request was approved. The role $role was granted to you!
    '''
    ROLE_REQUEST_REJECTED_MESSAGE: str = '''
    Your role request was rejected. You were not granted the role $role
    '''


settings = Settings()
