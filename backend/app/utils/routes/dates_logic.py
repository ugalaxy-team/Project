from datetime import datetime, timezone
from fastapi import HTTPException, status


def validate_dates_on_create(start_date, reg_start, reg_end):
    now = datetime.now()

    if reg_start < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration cannot start in the past",
        )

    if reg_end <= reg_start:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration end must be later than start",
        )

    if start_date <= reg_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament must start after registration ends",
        )


def validate_dates_on_update(
    *,
    start_date,
    reg_start,
    reg_end,
):
    now = datetime.now()

    if reg_start < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration start cannot be in the past",
        )

    if reg_end < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration end cannot be in the past",
        )

    if start_date < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament start cannot be in the past",
        )

    if reg_end <= reg_start:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration end must be later than start",
        )

    if start_date <= reg_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament must start after registration ends",
        )
