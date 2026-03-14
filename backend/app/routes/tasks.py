from fastapi import status, HTTPException
from fastapi.routing import APIRouter
from sqlalchemy import select, update
from app.dependencies import SessionDep
from app.models import Task
from app.schemas import TaskModel, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/", response_model=list[TaskModel], status_code=status.HTTP_200_OK)
async def tasks(session: SessionDep):
    statement = select(Task)
    users = await session.execute(statement)
    return users.scalars().all()


@router.get("/{task_id}", response_model=TaskModel, status_code=status.HTTP_200_OK)
async def task(task_id: int, session: SessionDep):
    statement = select(Task).where(Task.id == task_id)
    task = await session.execute(statement)
    if not task.first():
        raise HTTPException(
            status.HTTP_404_NOT_FOUND, detail=f"Task with ID {task_id} not found"
        )
    return task.first()


@router.post("/", response_model=TaskModel, status_code=status.HTTP_201_CREATED)
async def create_task(task_data: TaskModel, session: SessionDep):
    new_task = Task(**task_data.model_dump())

    session.add(new_task)
    await session.commit()
    await session.refresh(new_task)
    return new_task


@router.patch("/{task_id}", response_model=TaskModel, status_code=status.HTTP_200_OK)
async def update_task(task_id: int, task_data: TaskUpdate, session: SessionDep):
    update_data = task_data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    statement = (
        update(Task).where(Task.id == task_id).values(**update_data).returning(Task)
    )

    result = await session.execute(statement)
    updated_task = result.scalar_one_or_none()

    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    await session.commit()
    return updated_task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: int, session: SessionDep):
    statement = select(Task).where(Task.id == task_id)
    result = await session.execute(statement)

    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found",
        )

    await session.delete(task)
    await session.commit()
