from fastapi import status, HTTPException
from fastapi.routing import APIRouter
from sqlalchemy import select, update

from app.dependencies import SessionDep
from app.models import Task
from app.schemas import TaskModel, TaskUpdate
from app.utils.fsm import TaskStatus

router = APIRouter(prefix="/tournaments/{tournament_id}/tasks", tags=["tasks"])


async def get_task(task_id: int, session: SessionDep) -> Task:
    statement = select(Task).where(Task.id == task_id)
    task = (await session.execute(statement)).scalar()
    if not task:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Task not found!")
    return task


@router.get("/", response_model=list[TaskModel], status_code=status.HTTP_200_OK)
async def tasks(tournament_id: int, session: SessionDep):
    statement = select(Task).where(Task.tournament_id == tournament_id)
    result = await session.execute(statement)
    return result.scalars().all()


@router.get("/{task_id}/", response_model=TaskModel, status_code=status.HTTP_200_OK)
async def task(task_id: int, session: SessionDep):
    return await get_task(task_id, session)


@router.post("/", response_model=TaskModel, status_code=status.HTTP_201_CREATED)
async def create_task(tournament_id: int, task_data: TaskModel, session: SessionDep):
    new_task = Task(**task_data.model_dump())

    session.add(new_task)
    await session.commit()
    await session.refresh(new_task)
    return new_task


@router.patch("/{task_id}/", response_model=TaskModel, status_code=status.HTTP_200_OK)
async def update_task(task_id: int, task_data: TaskUpdate, session: SessionDep):
    update_data = task_data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    result = await session.execute(
        update(Task).where(Task.id == task_id).values(**update_data).returning(Task)
    )
    updated_task = result.scalar_one_or_none()

    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    await session.commit()
    return updated_task


@router.delete("/{task_id}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: int, session: SessionDep):
    task = await get_task(task_id, session)

    await session.delete(task)
    await session.commit()
