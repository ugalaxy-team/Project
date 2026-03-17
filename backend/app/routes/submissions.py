from fastapi import status, HTTPException
from fastapi.routing import APIRouter
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from app.dependencies import SessionDep
from app.models import Submission, SubmissionUrl, SubmissionUrlOption, Team
from app.schemas import SubmissionModel, SubmissionUrlOptionModel, SubmissionUrlModel

router = APIRouter(prefix="/submissions", tags=["submissions"])


async def get_submission(team_id: int, session: SessionDep) -> Submission:
    submission = await session.get(Submission, team_id)

    if submission is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found!"
        )

    return submission


@router.get("/", response_model=list[SubmissionModel], status_code=status.HTTP_200_OK)
async def submissions(session: SessionDep):
    statement = select(Submission)
    users = await session.execute(statement)
    return users.scalars().all()


@router.get(
    "/{team_id}/", response_model=SubmissionModel, status_code=status.HTTP_200_OK
)
async def submission(team_id: int, session: SessionDep):
    return await get_submission(team_id, session)


@router.post("/", response_model=SubmissionModel, status_code=status.HTTP_201_CREATED)
async def create_submission(submission_data: SubmissionModel, session: SessionDep):
    pass


@router.patch(
    "/{team_id}/", response_model=SubmissionModel, status_code=status.HTTP_200_OK
)
async def update_submission():
    pass


@router.delete("/{team_id}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_submission(team_id: int, session: SessionDep):
    submission = await get_submission(team_id, session)

    await session.delete(submission)
    await session.commit()
