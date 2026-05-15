"""empty message

Revision ID: 58852077e22f
Revises: 
Create Date: 2026-05-15 19:40:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '58852077e22f'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # --- 1. SUBMISSIONS TABLE ---
    op.add_column('submissions', sa.Column('id', sa.Integer(), nullable=False))
    
    # Drop existing PK. CASCADE automatically drops FKs in other tables pointing here.
    op.execute('ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_pkey CASCADE')
    op.execute('ALTER TABLE submissions ADD PRIMARY KEY (id)')
    
    with op.batch_alter_table('submissions', schema=None) as batch_op:
        batch_op.alter_column('task_id', existing_type=sa.INTEGER(), nullable=False)
        batch_op.create_unique_constraint('uq_submissions_team_task', ['team_id', 'task_id'])

    # --- 2. SUBMISSION_URLS TABLE ---
    op.add_column('submission_urls', sa.Column('id', sa.Integer(), nullable=False))
    op.execute('ALTER TABLE submission_urls DROP CONSTRAINT IF EXISTS submission_urls_pkey CASCADE')
    op.execute('ALTER TABLE submission_urls ADD PRIMARY KEY (id)')
    
    with op.batch_alter_table('submission_urls', schema=None) as batch_op:
        batch_op.alter_column('value', existing_type=sa.VARCHAR(), nullable=False)
        batch_op.create_unique_constraint('uq_submission_urls_sub_url', ['submission_id', 'url_id'])
        # Link to new ID. Note: Old FK was likely dropped by CASCADE above.
        batch_op.create_foreign_key('fk_submission_urls_submissions', 'submissions', ['submission_id'], ['id'], ondelete='CASCADE')

    # --- 3. UPDATE EVALUATIONS ---
    with op.batch_alter_table('evaluations', schema=None) as batch_op:
        batch_op.alter_column('assignment_id', existing_type=sa.INTEGER(), nullable=False)
        # Link to new ID.
        batch_op.create_foreign_key('fk_evaluations_submissions', 'submissions', ['submission_id'], ['id'], ondelete='CASCADE')

    # --- 4. UPDATE JURY_ASSIGNMENTS ---
    with op.batch_alter_table('jury_assignments', schema=None) as batch_op:
        # Link to new ID.
        batch_op.create_foreign_key('fk_jury_assignments_submissions', 'submissions', ['submission_id'], ['id'], ondelete='CASCADE')

def downgrade() -> None:
    with op.batch_alter_table('jury_assignments', schema=None) as batch_op:
        batch_op.drop_constraint('fk_jury_assignments_submissions', type_='foreignkey')

    with op.batch_alter_table('evaluations', schema=None) as batch_op:
        batch_op.drop_constraint('fk_evaluations_submissions', type_='foreignkey')
        batch_op.alter_column('assignment_id', existing_type=sa.INTEGER(), nullable=True)

    with op.batch_alter_table('submission_urls', schema=None) as batch_op:
        batch_op.drop_constraint('fk_submission_urls_submissions', type_='foreignkey')
        batch_op.drop_constraint('uq_submission_urls_sub_url', type_='unique')
        batch_op.drop_column('id')

    with op.batch_alter_table('submissions', schema=None) as batch_op:
        batch_op.drop_constraint('uq_submissions_team_task', type_='unique')
        batch_op.drop_column('id')
