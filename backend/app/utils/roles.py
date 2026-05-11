from fastapi import HTTPException, status
from sqlalchemy import select
from app.dependencies.session import SessionDep
from app.models import Role


async def get_role(name: str, session: SessionDep):
    statement = select(Role).where(Role.name == name)
    role = (await session.execute(statement)).scalar()
    if not role:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Role not found!")
    return role
