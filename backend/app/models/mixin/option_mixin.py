from sqlalchemy.orm import Mapped, mapped_column

class OptionMixin:
    name: Mapped[str] = mapped_column(primary_key=True)
    display_name: Mapped[str]