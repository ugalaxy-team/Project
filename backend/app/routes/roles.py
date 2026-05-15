from fastapi import APIRouter
from app.schemas import RolePublic
from app.models import Role
from app.dependencies import SessionDep
from sqlalchemy import select
from app.utils import get_role

router = APIRouter(prefix="/roles", tags=["roles"])


@router.get("/", response_model=list[RolePublic])
async def roles(session: SessionDep):
    statement = select(Role)
    roles = await session.execute(statement)
    return roles.scalars().all()


@router.get("/{name}/", response_model=RolePublic)
async def role(name: str, session: SessionDep):
    return await get_role(name, session)
