"""remove evaluation categories, rewire criteria to task

Revision ID: 11815fd74eb9
Revises: f731d7aac974
Create Date: 2026-05-12 23:37:10.737087

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "11815fd74eb9"
down_revision: Union[str, Sequence[str], None] = "f731d7aac974"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("task_evaluation_criteria") as batch_op:
        batch_op.add_column(sa.Column("task_id", sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            "fk_criteria_task", "tasks", ["task_id"], ["id"], ondelete="CASCADE"
        )

    op.execute(
        "UPDATE task_evaluation_criteria SET task_id = ("
        "SELECT task_evaluation_categories.task_id "
        "FROM task_evaluation_categories "
        "WHERE task_evaluation_categories.id = task_evaluation_criteria.category_id"
        ")"
    )

    with op.batch_alter_table("task_evaluation_criteria") as batch_op:
        batch_op.alter_column("task_id", nullable=False)
        batch_op.drop_constraint(
            batch_op.f("task_evaluation_criteria_category_id_fkey"),
            type_="foreignkey",
        )
        batch_op.drop_column("category_id")

    op.drop_table("task_evaluation_categories")


def downgrade() -> None:
    op.create_table(
        "task_evaluation_categories",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("task_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["task_id"],
            ["tasks.id"],
            name=op.f("task_evaluation_categories_task_id_fkey"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("task_evaluation_categories_pkey")),
    )

    with op.batch_alter_table("task_evaluation_criteria") as batch_op:
        batch_op.add_column(
            sa.Column("category_id", sa.Integer(), nullable=True)
        )
        batch_op.create_foreign_key(
            batch_op.f("task_evaluation_criteria_category_id_fkey"),
            "task_evaluation_categories",
            ["category_id"],
            ["id"],
            ondelete="CASCADE",
        )

    op.execute(
        "UPDATE task_evaluation_criteria SET category_id = ("
        "SELECT task_evaluation_categories.id "
        "FROM task_evaluation_categories "
        "WHERE task_evaluation_categories.task_id = task_evaluation_criteria.task_id"
        ")"
    )

    with op.batch_alter_table("task_evaluation_criteria") as batch_op:
        batch_op.alter_column("category_id", nullable=False)
        batch_op.drop_constraint("fk_criteria_task", type_="foreignkey")
        batch_op.drop_column("task_id")
