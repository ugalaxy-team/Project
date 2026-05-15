from fastapi import status, HTTPException
from fastapi.routing import APIRouter
from sqlalchemy import select

from app.config import settings
from app.dependencies import SessionDep, TaskOwnerDep
from app.models import Task, TaskEvaluationCriterion, Submission, SubmissionUrl
from app.schemas import TaskCreate, TaskUpdate, TaskPublic, SubmissionCreate, SubmissionModel
from app.utils import TaskStatus, update_tasks_status, get_requirements, get_task, get_team

router = APIRouter(prefix="/tournaments/{tournament_id}/tasks", tags=["tasks"])


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


@router.post(
    "/",
    response_model=TaskPublic,
    status_code=status.HTTP_201_CREATED,
)
async def create_task(tournament_id: int, task_data: TaskCreate, session: SessionDep):
    task_dict = task_data.model_dump(exclude={"requirements", "criteria"})
    
    if task_dict.get("start_time"):
        task_dict["start_time"] = task_dict["start_time"].replace(tzinfo=None)
    if task_dict.get("end_time"):
        task_dict["end_time"] = task_dict["end_time"].replace(tzinfo=None)

    new_task = Task(
        **task_dict,
        tournament_id=tournament_id,
        status_id=settings.TASK_STATUS_NAMES.DRAFT,
    )
    
    requirements = await get_requirements(task_data.requirements, session)
    new_task.requirements = requirements

    session.add(new_task)
    await session.flush()
    
    await session.refresh(new_task, ["criteria"])

    for crit_data in task_data.criteria:
        new_task.criteria.append(
            TaskEvaluationCriterion(
                task_id=new_task.id,
                name=crit_data.name,
                description=crit_data.description,
                weight=crit_data.weight,
                max_score=crit_data.max_score,
            )
        )

    await session.commit()
    await session.refresh(new_task)
    return new_task


@router.patch(
    "/{task_id}/",
    response_model=TaskPublic,
    status_code=status.HTTP_200_OK,
)
async def update_task(
    tournament_id: int,
    task_data: TaskUpdate,
    session: SessionDep,
    task: TaskOwnerDep,
):
    if task.tournament_id != tournament_id:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="Task does not belong to this tournament",
        )

    update_data = task_data.model_dump(
        exclude_unset=True, exclude={"requirements", "criteria"}
    )

    if not update_data and task_data.requirements is None and task_data.criteria is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    if update_data.get("start_time"):
        update_data["start_time"] = update_data["start_time"].replace(tzinfo=None)
    if update_data.get("end_time"):
        update_data["end_time"] = update_data["end_time"].replace(tzinfo=None)

    for key, value in update_data.items():
        setattr(task, key, value)

    if task_data.requirements is not None:
        task.requirements = await get_requirements(task_data.requirements, session)

    if task_data.criteria is not None:
        await session.refresh(task, ["criteria"])
        for crit in list(task.criteria):
            await session.delete(crit)
        
        for crit_data in task_data.criteria:
            task.criteria.append(
                TaskEvaluationCriterion(
                    task_id=task.id,
                    name=crit_data.name,
                    description=crit_data.description,
                    weight=crit_data.weight,
                    max_score=crit_data.max_score,
                )
            )

    TaskStatus(task).update_by_time()

    await session.commit()
    await session.refresh(task)

    return task


@router.delete(
    "/{task_id}/",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_task(session: SessionDep, task: TaskOwnerDep):
    await session.delete(task)
    await session.commit()


@router.post(
    "/{task_id}/submissions/",
    response_model=SubmissionModel,
    status_code=status.HTTP_201_CREATED,
)
async def create_submission(
    tournament_id: int, task_id: int, submission_data: SubmissionCreate, session: SessionDep
):
    await get_team(submission_data.team_id, tournament_id, session)

    new_submission = Submission(team_id=submission_data.team_id, task_id=task_id)
    session.add(new_submission)
    await session.flush()

    for item in submission_data.urls:
        session.add(SubmissionUrl(
            submission_id=new_submission.id,
            url_id=item.url_id,
            value=item.value,
        ))

    await session.commit()
    await session.refresh(new_submission, ["urls", "team"])

    return new_submission