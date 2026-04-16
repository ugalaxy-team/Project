from fastapi import APIRouter, HTTPException, status
from app.schemas import RolePublic
from app.models import Role
from app.dependencies import SessionDep
from sqlalchemy import select

router = APIRouter(prefix='/roles', tags=['roles'])

async def get_role(name: str, session: SessionDep):
    statement = select(Role).where(Role.name==name)
    role = (await session.execute(statement)).scalar()
    if not role:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail='Role not found!')
    return role

@router.get('/', response_model=list[RolePublic])
async def roles(session: SessionDep):
    statement = select(Role)
    roles = await session.execute(statement)
    return roles.scalars().all()

@router.get('/{name}/', response_model=RolePublic)
async def role(name: str, session: SessionDep):
    return await get_role(name, session)