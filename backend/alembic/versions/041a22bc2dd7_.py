"""empty message

Revision ID: 041a22bc2dd7
Revises: 0a7a46f486f9
Create Date: 2026-05-10 07:48:08.241897

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '041a22bc2dd7'
down_revision: Union[str, Sequence[str], None] = '0a7a46f486f9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Step 1: First, drop the current FK constraints that reference submissions.team_id
    op.execute("ALTER TABLE evaluations DROP CONSTRAINT IF EXISTS evaluations_submission_id_fkey")
    op.execute("ALTER TABLE jury_assignments DROP CONSTRAINT IF EXISTS jury_assignments_submission_id_fkey")
    op.execute("ALTER TABLE submission_urls DROP CONSTRAINT IF EXISTS submission_urls_submission_id_fkey")
    
    # Step 2: Now restructure the submissions table
    # Drop the current team_id primary key and make id the primary key
    op.execute("ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_pkey")
    op.execute("ALTER TABLE submissions ADD PRIMARY KEY (id)")
    
    # Add unique constraint on team_id to preserve the uniqueness requirement
    op.execute("ALTER TABLE submissions ADD CONSTRAINT submissions_team_id_key UNIQUE(team_id)")
    
    # Step 3: Make task_id NOT NULL
    op.execute("ALTER TABLE submissions ALTER COLUMN task_id SET NOT NULL")
    
    # Step 4: Add the composite unique constraint on (team_id, task_id)
    op.execute("ALTER TABLE submissions ADD CONSTRAINT submissions_team_id_task_id_key UNIQUE(team_id, task_id)")
    
    # Step 5: Now recreate the foreign keys to reference submissions.id
    op.execute("ALTER TABLE evaluations ADD CONSTRAINT evaluations_submission_id_fkey FOREIGN KEY(submission_id) REFERENCES submissions (id) ON DELETE CASCADE")
    
    op.execute("ALTER TABLE jury_assignments ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT now()")
    op.execute("ALTER TABLE jury_assignments ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT now()")
    op.execute("ALTER TABLE jury_assignments DROP COLUMN IF EXISTS assigned_at")
    op.execute("ALTER TABLE jury_assignments ADD CONSTRAINT jury_assignments_submission_id_fkey FOREIGN KEY(submission_id) REFERENCES submissions (id) ON DELETE CASCADE")
    
    op.execute("ALTER TABLE submission_urls ADD CONSTRAINT submission_urls_submission_id_fkey FOREIGN KEY(submission_id) REFERENCES submissions (id) ON DELETE CASCADE")


def downgrade() -> None:
    """Downgrade schema."""
    # Step 1: Drop the new constraints and FK
    op.execute("ALTER TABLE submission_urls DROP CONSTRAINT IF EXISTS submission_urls_submission_id_fkey")
    op.execute("ALTER TABLE jury_assignments DROP CONSTRAINT IF EXISTS jury_assignments_submission_id_fkey")
    op.execute("ALTER TABLE evaluations DROP CONSTRAINT IF EXISTS evaluations_submission_id_fkey")
    
    # Step 2: Restore jury_assignments columns
    op.execute("ALTER TABLE jury_assignments DROP COLUMN IF EXISTS created_at")
    op.execute("ALTER TABLE jury_assignments DROP COLUMN IF EXISTS updated_at")
    op.execute("ALTER TABLE jury_assignments ADD COLUMN assigned_at TIMESTAMP DEFAULT now()")
    
    # Step 3: Restore submissions table structure
    # Drop the new primary key and constraints
    op.execute("ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_team_id_task_id_key")
    op.execute("ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_team_id_key")
    op.execute("ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_pkey")
    
    # Restore team_id as primary key
    op.execute("ALTER TABLE submissions ADD PRIMARY KEY (team_id)")
    
    # Make task_id nullable again
    op.execute("ALTER TABLE submissions ALTER COLUMN task_id DROP NOT NULL")
    
    # Step 4: Recreate the old foreign keys (referencing team_id)
    op.execute("ALTER TABLE submission_urls ADD CONSTRAINT submission_urls_submission_id_fkey FOREIGN KEY(submission_id) REFERENCES submissions (team_id) ON DELETE CASCADE")
    op.execute("ALTER TABLE jury_assignments ADD CONSTRAINT jury_assignments_submission_id_fkey FOREIGN KEY(submission_id) REFERENCES submissions (team_id) ON DELETE CASCADE")
    op.execute("ALTER TABLE evaluations ADD CONSTRAINT evaluations_submission_id_fkey FOREIGN KEY(submission_id) REFERENCES submissions (team_id) ON DELETE CASCADE")
