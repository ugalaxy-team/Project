"""merge heads

Revision ID: d3b8f6c4a1e2
Revises: e24fb9138dcd, eb2f31fb86a1
Create Date: 2026-04-23 12:34:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd3b8f6c4a1e2'
down_revision: Union[str, Sequence[str], None] = ('e24fb9138dcd', 'eb2f31fb86a1')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Merge revision: no schema changes."""
    pass


def downgrade() -> None:
    """Downgrade merge: not implemented."""
    pass
