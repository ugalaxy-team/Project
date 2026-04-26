"""empty message

Revision ID: 34dab362d59d
Revises: 2dfbaad89f88
Create Date: 2026-04-26 10:48:34.438682

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '34dab362d59d'
down_revision: Union[str, Sequence[str], None] = '2dfbaad89f88'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('tournaments', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('tournaments_status_id_fkey'), type_='foreignkey')
        batch_op.add_column(sa.Column('status_name', sa.String(), nullable=True))

    op.execute(
        """
        UPDATE tournaments AS t
        SET status_name = tso.name
        FROM tournament_status_options AS tso
        WHERE t.status_id = tso.id
        """
    )

    with op.batch_alter_table('tournaments', schema=None) as batch_op:
        batch_op.drop_column('status_id')
        batch_op.alter_column('status_name', existing_type=sa.String(), nullable=False)
        batch_op.alter_column('status_name', new_column_name='status_id')

    with op.batch_alter_table('tournament_status_options', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_tournament_status_options_name'))
        batch_op.drop_constraint('tournament_status_options_pkey', type_='primary')
        batch_op.create_primary_key('tournament_status_options_pkey', ['name'])
        batch_op.drop_column('id')

    with op.batch_alter_table('tournaments', schema=None) as batch_op:
        batch_op.create_foreign_key(
            batch_op.f('tournaments_status_id_fkey'),
            'tournament_status_options',
            ['status_id'],
            ['name'],
        )


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('tournaments', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('tournaments_status_id_fkey'), type_='foreignkey')
        batch_op.add_column(sa.Column('status_int_id', sa.Integer(), nullable=True))

    with op.batch_alter_table('tournament_status_options', schema=None) as batch_op:
        batch_op.add_column(sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=True))
        batch_op.drop_constraint('tournament_status_options_pkey', type_='primary')
        batch_op.create_index(batch_op.f('ix_tournament_status_options_name'), ['name'], unique=True)

    op.execute(
        """
        WITH numbered AS (
            SELECT name, ROW_NUMBER() OVER (ORDER BY name) AS new_id
            FROM tournament_status_options
        )
        UPDATE tournament_status_options AS tso
        SET id = numbered.new_id
        FROM numbered
        WHERE tso.name = numbered.name
        """
    )

    op.execute(
        """
        UPDATE tournaments AS t
        SET status_int_id = tso.id
        FROM tournament_status_options AS tso
        WHERE t.status_id = tso.name
        """
    )

    with op.batch_alter_table('tournaments', schema=None) as batch_op:
        batch_op.drop_column('status_id')
        batch_op.alter_column('status_int_id', existing_type=sa.Integer(), nullable=False)
        batch_op.alter_column('status_int_id', new_column_name='status_id')

    with op.batch_alter_table('tournament_status_options', schema=None) as batch_op:
        batch_op.create_primary_key('tournament_status_options_pkey', ['id'])

    with op.batch_alter_table('tournaments', schema=None) as batch_op:
        batch_op.create_foreign_key(
            batch_op.f('tournaments_status_id_fkey'),
            'tournament_status_options',
            ['status_id'],
            ['id'],
        )
