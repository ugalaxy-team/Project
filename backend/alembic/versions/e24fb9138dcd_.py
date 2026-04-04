"""empty message

Revision ID: e24fb9138dcd
Revises: e15113d4ca9c
Create Date: 2026-04-04 12:58:05.603122

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e24fb9138dcd'
down_revision: Union[str, Sequence[str], None] = 'e15113d4ca9c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Drop dependent FKs before touching the referenced constraint
    with op.batch_alter_table('role_requests', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('role_requests_role_name_fkey'), type_='foreignkey')

    with op.batch_alter_table('user_roles', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('user_roles_role_name_fkey'), type_='foreignkey')

    with op.batch_alter_table('roles', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('roles_pkey'), type_='primary')
        batch_op.drop_constraint(batch_op.f('roles_name_key'), type_='unique')
        batch_op.add_column(sa.Column('description', sa.String(length=4096), nullable=False))
        batch_op.add_column(sa.Column('display_name', sa.String(), nullable=False))
        batch_op.drop_column('id')
        batch_op.create_primary_key(batch_op.f('roles_pkey'), ['name'])

    with op.batch_alter_table('user_roles', schema=None) as batch_op:
        batch_op.create_foreign_key(
            batch_op.f('user_roles_role_name_fkey'), 'roles', ['role_name'], ['name'], ondelete='CASCADE'
        )

    with op.batch_alter_table('role_requests', schema=None) as batch_op:
        batch_op.create_foreign_key(
            batch_op.f('role_requests_role_name_fkey'), 'roles', ['role_name'], ['name']
        )


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('role_requests', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('role_requests_role_name_fkey'), type_='foreignkey')

    with op.batch_alter_table('user_roles', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('user_roles_role_name_fkey'), type_='foreignkey')

    with op.batch_alter_table('roles', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('roles_pkey'), type_='primary')
        batch_op.add_column(sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False))
        batch_op.create_primary_key(batch_op.f('roles_pkey'), ['id'])
        batch_op.create_unique_constraint(batch_op.f('roles_name_key'), ['name'], postgresql_nulls_not_distinct=False)
        batch_op.drop_column('display_name')
        batch_op.drop_column('description')

    with op.batch_alter_table('user_roles', schema=None) as batch_op:
        batch_op.create_foreign_key(
            batch_op.f('user_roles_role_name_fkey'), 'roles', ['role_name'], ['name'], ondelete='CASCADE'
        )

    with op.batch_alter_table('role_requests', schema=None) as batch_op:
        batch_op.create_foreign_key(
            batch_op.f('role_requests_role_name_fkey'), 'roles', ['role_name'], ['name']
        )
