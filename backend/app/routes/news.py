from fastapi import APIRouter, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.schemas import NewsPublic
from app.dependencies import SessionDep
from app.models import News

router = APIRouter(prefix="/news", tags=["news"])


@router.get("/", response_model=list[NewsPublic], status_code=status.HTTP_200_OK)
async def get_news(session: SessionDep):
    statement = (
        select(News).options(selectinload(News.category)).order_by(News.created_at.desc())
    )
    result = await session.execute(statement)
    return result.scalars().all()
