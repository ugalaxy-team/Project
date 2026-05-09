"""fix_heads

Revision ID: 707211cdd0c9
Revises: 395793e08475, 39b777378bc8, d29a9dc3f541
Create Date: 2026-05-06 18:49:40.087595

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '707211cdd0c9'
down_revision: Union[str, Sequence[str], None] = ('395793e08475', '39b777378bc8', 'd29a9dc3f541')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
