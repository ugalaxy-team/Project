"""merge two base branches

Revision ID: 6150229200ba
Revises: cd57b38a80ee
Create Date: 2026-05-03 14:22:36.700041

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6150229200ba'
down_revision: Union[str, Sequence[str], None] = 'cd57b38a80ee'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
