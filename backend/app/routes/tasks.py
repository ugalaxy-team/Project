from fastapi import status, HTTPException
from fastapi.routing import APIRouter
from sqlalchemy import select

from app.config import settings
from app.dependencies import SessionDep
from app.models import Task
from app.schemas import TaskCreate, TaskUpdate, TaskPublic
from app.utils.fsm import TaskStatus, update_tasks_status
from app.utils.routes import get_requirements

router = APIRouter(prefix="/tournaments/{tournament_id}/tasks", tags=["tasks"])


async def get_task(task_id: int, session: SessionDep) -> Task:
    statement = select(Task).where(Task.id == task_id)
    task = (await session.execute(statement)).scalar()
    if not task:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Task not found!")
    return task


@router.get("/", response_model=list[TaskPublic], status_code=status.HTTP_200_OK)
async def tasks(tournament_id: int, session: SessionDep):
    await update_tasks_status(session)
    statement = select(Task).where(Task.tournament_id == tournament_id)
    result = await session.execute(statement)
    return result.scalars().all()


@router.get("/{task_id}/", response_model=TaskPublic, status_code=status.HTTP_200_OK)
async def task(tournament_id: int, task_id: int, session: SessionDep):
    task = await get_task(task_id, session)

    if task.tournament_id != tournament_id:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="Task does not belong to this tournament",
        )

    TaskStatus(task).update_by_time()
    await session.commit()
    await session.refresh(task)

    return task


@router.post("/", response_model=TaskPublic, status_code=status.HTTP_201_CREATED)
async def create_task(tournament_id: int, task_data: TaskCreate, session: SessionDep):
    task_dict = task_data.model_dump(exclude={"requirements"})
    new_task = Task(
        **task_dict,
        tournament_id=tournament_id,
        status_id=settings.TASK_STATUS_NAMES.DRAFT,
    )
    requirements = await get_requirements(task_data.requirements, session)
    new_task.requirements = requirements

    session.add(new_task)
    await session.commit()
    await session.refresh(new_task)
    return new_task


@router.patch("/{task_id}/", response_model=TaskPublic, status_code=status.HTTP_200_OK)
async def update_task(
    tournament_id: int, task_id: int, task_data: TaskUpdate, session: SessionDep
):
    task = await get_task(task_id, session)

    if task.tournament_id != tournament_id:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="Task does not belong to this tournament",
        )

    update_data = task_data.model_dump(exclude_unset=True, exclude={"requirements"})

    if not update_data and task_data.requirements is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    for key, value in update_data.items():
        setattr(task, key, value)

    if task_data.requirements is not None:
        task.requirements = await get_requirements(task_data.requirements, session)
    TaskStatus(task).update_by_time()

    await session.commit()
    await session.refresh(task)

    return task


@router.delete("/{task_id}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: int, session: SessionDep):
    task = await get_task(task_id, session)

    await session.delete(task)
    await session.commit()
