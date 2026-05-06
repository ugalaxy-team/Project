from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import func
from datetime import datetime


class DatetimeMixin:
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now()
    )
