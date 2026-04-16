from fastapi import status, HTTPException
from fastapi.routing import APIRouter
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError

from app.dependencies import SessionDep
from app.models import Submission, SubmissionUrl, SubmissionUrlOption, Team
from app.schemas import SubmissionModel, SubmissionUrlOptionModel, SubmissionUrlModel

router = APIRouter(prefix="/submissions", tags=["submissions"])


async def get_submission(team_id: int, session: SessionDep) -> Submission:
    statement = (
        select(Submission)
        .where(Submission.team_id == team_id)
        .options(selectinload(Submission.urls).selectinload(SubmissionUrl.url))
    )
    result = await session.execute(statement)
    submission = result.scalar_one_or_none()

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


# Not ready yet

# @router.post("/", response_model=SubmissionModel, status_code=status.HTTP_201_CREATED)
# async def create_submission(submission_data: SubmissionModel, session: SessionDep):
#     team = await session.get(Team, submission_data.team_id)
#     if not team:
#         raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Team not found")

#     new_submission = Submission(team_id=submission_data.team_id)

#     for url_item in submission_data.urls:
#         new_submission.urls.append(SubmissionUrl(url_id=url_item.url_id))

#     session.add(new_submission)

#     try:
#         await session.commit()
#         await session.refresh(new_submission)
#     except IntegrityError:
#         await session.rollback()
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Submission for this team already exists",
#         )

#     return new_submission


# @router.patch(
#     "/{team_id}/", response_model=SubmissionModel, status_code=status.HTTP_200_OK
# )
# async def update_submission():
#     pass


@router.delete("/{team_id}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_submission(team_id: int, session: SessionDep):
    submission = await get_submission(team_id, session)

    await session.delete(submission)
    await session.commit()
