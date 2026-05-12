"""fix_schema

Revision ID: f731d7aac974
Revises: 7145b4774739
Create Date: 2026-05-12 22:01:42.766688

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'f731d7aac974'
down_revision: Union[str, Sequence[str], None] = '7145b4774739'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE evaluations DROP CONSTRAINT IF EXISTS evaluations_submission_id_fkey")
    op.execute("ALTER TABLE jury_assignments DROP CONSTRAINT IF EXISTS jury_assignments_submission_id_fkey")
    op.execute("ALTER TABLE submission_urls DROP CONSTRAINT IF EXISTS submission_urls_submission_id_fkey")

    op.execute("ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_team_id_task_id_key")
    op.execute("ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_pkey")
    op.execute("ALTER TABLE submissions DROP COLUMN IF EXISTS id")
    op.execute("ALTER TABLE submissions DROP COLUMN IF EXISTS created_at")
    op.execute("ALTER TABLE submissions DROP COLUMN IF EXISTS updated_at")
    op.execute("ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_team_id_key")
    op.execute("ALTER TABLE submissions ADD CONSTRAINT submissions_pkey PRIMARY KEY (team_id)")

    op.execute("ALTER TABLE evaluations ADD CONSTRAINT evaluations_submission_id_fkey FOREIGN KEY(submission_id) REFERENCES submissions (team_id) ON DELETE CASCADE")
    op.execute("ALTER TABLE jury_assignments ADD CONSTRAINT jury_assignments_submission_id_fkey FOREIGN KEY(submission_id) REFERENCES submissions (team_id) ON DELETE CASCADE")
    op.execute("ALTER TABLE submission_urls ADD CONSTRAINT submission_urls_submission_id_fkey FOREIGN KEY(submission_id) REFERENCES submissions (team_id) ON DELETE CASCADE")

    op.execute("ALTER TABLE task_evaluation_categories DROP COLUMN \"order\"")
    op.execute("ALTER TABLE task_evaluation_criteria DROP COLUMN \"order\"")


def downgrade() -> None:
    op.execute("ALTER TABLE task_evaluation_criteria ADD COLUMN \"order\" INTEGER NOT NULL DEFAULT 0")
    op.execute("ALTER TABLE task_evaluation_categories ADD COLUMN \"order\" INTEGER NOT NULL DEFAULT 0")

    op.execute("ALTER TABLE evaluations DROP CONSTRAINT IF EXISTS evaluations_submission_id_fkey")
    op.execute("ALTER TABLE jury_assignments DROP CONSTRAINT IF EXISTS jury_assignments_submission_id_fkey")
    op.execute("ALTER TABLE submission_urls DROP CONSTRAINT IF EXISTS submission_urls_submission_id_fkey")

    op.execute("ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_pkey")
    op.execute("ALTER TABLE submissions ADD COLUMN id SERIAL")
    op.execute("ALTER TABLE submissions ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT now()")
    op.execute("ALTER TABLE submissions ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT now()")
    op.execute("ALTER TABLE submissions ADD PRIMARY KEY (id)")
    op.execute("ALTER TABLE submissions ADD CONSTRAINT submissions_team_id_key UNIQUE(team_id)")
    op.execute("ALTER TABLE submissions ADD CONSTRAINT submissions_team_id_task_id_key UNIQUE(team_id, task_id)")

    op.execute("ALTER TABLE submission_urls ADD CONSTRAINT submission_urls_submission_id_fkey FOREIGN KEY(submission_id) REFERENCES submissions (id) ON DELETE CASCADE")
    op.execute("ALTER TABLE jury_assignments ADD CONSTRAINT jury_assignments_submission_id_fkey FOREIGN KEY(submission_id) REFERENCES submissions (id) ON DELETE CASCADE")
    op.execute("ALTER TABLE evaluations ADD CONSTRAINT evaluations_submission_id_fkey FOREIGN KEY(submission_id) REFERENCES submissions (id) ON DELETE CASCADE")
