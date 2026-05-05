from fastapi import status, HTTPException, Depends
from typing import Annotated
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from .session import SessionDep
from app.models import RoleRequest, RoleRequestInfo


async def get_role_request(request_id: int, session: SessionDep) -> RoleRequest:
    statement = (
        select(RoleRequest)
        .options(
            selectinload(RoleRequest.info).selectinload(RoleRequestInfo.option),
            selectinload(RoleRequest.role),
            selectinload(RoleRequest.user),
        )
        .where(RoleRequest.id == request_id)
    )
    result = await session.execute(statement)
    request = result.scalar()
    if not request:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Role request not found!")

    return request


RoleRequestDep = Annotated[RoleRequest, Depends(get_role_request)]
