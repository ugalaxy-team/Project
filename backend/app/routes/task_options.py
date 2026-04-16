from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from app.models import TaskRequirementOption, TaskRequirementCategory
from app.schemas import TaskRequirementOptionCreate, TaskRequirementOptionPublic
from app.dependencies import SessionDep

router = APIRouter(prefix="/task-options", tags=["task-options"])


@router.get(
    "/",
    response_model=list[TaskRequirementOptionPublic],
    status_code=status.HTTP_200_OK,
)
async def get_all_options(session: SessionDep):
    result = await session.execute(select(TaskRequirementOption))
    return result.scalars().all()


@router.delete("/{name}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_option(name: str, session: SessionDep):
    option = await session.get(TaskRequirementOption, name)
    if not option:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Option not found"
        )

    await session.delete(option)
    await session.commit()


@router.post(
    "/", response_model=TaskRequirementOptionPublic, status_code=status.HTTP_201_CREATED
)
async def create_requirement_option(
    data: TaskRequirementOptionCreate, session: SessionDep
):
    category = await session.get(TaskRequirementCategory, data.category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category '{data.category_id}' not found",
        )

    existing = await session.get(TaskRequirementOption, data.name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Option with this name already exists",
        )

    new_option = TaskRequirementOption(**data.model_dump())
    session.add(new_option)
    await session.commit()
    await session.refresh(new_option)
    return new_option
