"""Remove is_global column from notifications table

Revision ID: d146519cd8df
Revises: 6150229200ba
Create Date: 2026-05-03 20:18:01.936401

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd146519cd8df'
down_revision: Union[str, Sequence[str], None] = '6150229200ba'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_column('notifications', 'is_global')


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column('notifications', sa.Column('is_global', sa.Boolean(), nullable=False, server_default=sa.false()))
