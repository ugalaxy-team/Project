from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session, Session
from app.config import settings

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
Sess = scoped_session(sessionmaker(bind=engine))

def get_session() -> Session:
    with Sess() as sess:
        return sess