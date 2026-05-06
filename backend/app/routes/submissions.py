from fastapi import status, HTTPException, APIRouter
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError

from app.dependencies import SessionDep
from app.models import Submission, SubmissionUrl
from app.schemas import SubmissionCreate, SubmissionPublic, SubmissionUpdate
from app.utils import check_submission_deadline

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


@router.get("/", response_model=list[SubmissionPublic], status_code=status.HTTP_200_OK)
async def submissions(session: SessionDep):
    statement = select(Submission).options(
        selectinload(Submission.urls).selectinload(SubmissionUrl.url)
    )
    submissions = await session.execute(statement)
    return submissions.scalars().all()


@router.get(
    "/{team_id}/", response_model=SubmissionPublic, status_code=status.HTTP_200_OK
)
async def submission(team_id: int, session: SessionDep):
    return await get_submission(team_id, session)


@router.post("/", response_model=SubmissionPublic, status_code=status.HTTP_201_CREATED)
async def create_submission(submission_data: SubmissionCreate, session: SessionDep):

    await check_submission_deadline(submission_data.team_id, session)

    new_submission = Submission(
        team_id=submission_data.team_id, description=submission_data.description
    )

    for url_item in submission_data.urls:
        new_submission.urls.append(
            SubmissionUrl(url_id=url_item.url_id, url_value=url_item.url_value)
        )

    session.add(new_submission)

    try:
        await session.commit()
        await session.refresh(new_submission)
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submission for this team already exists",
        )

    return new_submission


@router.patch(
    "/{team_id}/", response_model=SubmissionPublic, status_code=status.HTTP_200_OK
)
async def update_submission(
    team_id: int, submission_data: SubmissionUpdate, session: SessionDep
):
    await check_submission_deadline(team_id, session)
    update_data = submission_data.model_dump(exclude_unset=True, exclude={"urls"})
    new_urls = submission_data.urls

    if not update_data and new_urls is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    if update_data:
        stmt = (
            update(Submission)
            .where(Submission.team_id == team_id)
            .values(**update_data)
        )
        result = await session.execute(stmt)

        if result.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found"
            )

    if new_urls is not None:
        submission = await get_submission(team_id, session)
        submission.urls.clear()

        for url_item in new_urls:
            submission.urls.append(
                SubmissionUrl(url_id=url_item.url_id, url_value=url_item.url_value)
            )

    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Update failed: check if all URL options are valid.",
        )

    return await get_submission(team_id, session)


@router.delete("/{team_id}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_submission(team_id: int, session: SessionDep):
    await check_submission_deadline(team_id, session)

    submission = await get_submission(team_id, session)
    await session.delete(submission)
    await session.commit()
