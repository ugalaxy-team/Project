from app.db import get_session
from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

Session = Annotated[AsyncSession, Depends(get_session)]