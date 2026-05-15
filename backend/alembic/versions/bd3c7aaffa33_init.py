"""init

Revision ID: bd3c7aaffa33
Revises:
Create Date: 2026-05-13 20:21:46.540959
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "bd3c7aaffa33"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "jury_assignment_statuses",
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("display_name", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("name"),
    )

    op.create_table(
        "task_evaluation_criteria",
        sa.Column("task_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("weight", sa.Integer(), nullable=False),
        sa.Column("max_score", sa.Integer(), nullable=False),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["task_id"],
            ["tasks.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "jury_assignments",
        sa.Column("task_id", sa.Integer(), nullable=False),
        sa.Column("submission_id", sa.Integer(), nullable=False),
        sa.Column("jury_id", sa.Integer(), nullable=False),
        sa.Column("status_id", sa.String(), nullable=False),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["jury_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["status_id"],
            ["jury_assignment_statuses.name"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["submission_id"],
            ["submissions.team_id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["task_id"],
            ["tasks.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("submission_id", "jury_id"),
    )

    op.create_table(
        "criterion_scores",
        sa.Column("evaluation_id", sa.Integer(), nullable=False),
        sa.Column("criterion_id", sa.Integer(), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["criterion_id"],
            ["task_evaluation_criteria.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["evaluation_id"],
            ["evaluations.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("evaluation_id", "criterion_id"),
    )

    op.drop_table("evaluation_requirements")
    op.drop_table("requirement_evaluations")

    with op.batch_alter_table("evaluations", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                "assignment_id",
                sa.Integer(),
                nullable=True,
            )
        )

        batch_op.add_column(
            sa.Column(
                "comment",
                sa.String(),
                nullable=True,
            )
        )

        batch_op.add_column(
            sa.Column(
                "created_at",
                sa.DateTime(),
                server_default=sa.text("now()"),
                nullable=False,
            )
        )

        batch_op.add_column(
            sa.Column(
                "updated_at",
                sa.DateTime(),
                server_default=sa.text("now()"),
                nullable=False,
            )
        )

        batch_op.create_foreign_key(
            None,
            "jury_assignments",
            ["assignment_id"],
            ["id"],
            ondelete="CASCADE",
        )

    with op.batch_alter_table("submission_urls", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                "value",
                sa.String(),
                nullable=True,
            )
        )

    with op.batch_alter_table("submissions", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                "task_id",
                sa.Integer(),
                nullable=True,
            )
        )

        batch_op.create_foreign_key(
            None,
            "tasks",
            ["task_id"],
            ["id"],
            ondelete="CASCADE",
        )

    with op.batch_alter_table("tasks", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                "min_reviews_per_submission",
                sa.Integer(),
                nullable=False,
                server_default="1",
            )
        )

        batch_op.add_column(
            sa.Column(
                "max_score",
                sa.Integer(),
                nullable=False,
                server_default="100",
            )
        )

        batch_op.add_column(
            sa.Column(
                "is_leaderboard_visible",
                sa.Boolean(),
                nullable=False,
                server_default=sa.text("false"),
            )
        )

        batch_op.create_foreign_key(
            "fk_task_tournament",
            "tournaments",
            ["tournament_id"],
            ["id"],
            ondelete="CASCADE",
            use_alter=True,
        )

    with op.batch_alter_table("team_members", schema=None) as batch_op:
        batch_op.create_foreign_key(
            "fk_teammember_team",
            "teams",
            ["team_id"],
            ["id"],
            ondelete="CASCADE",
            use_alter=True,
        )


def downgrade() -> None:
    """Downgrade schema."""

    with op.batch_alter_table("team_members", schema=None) as batch_op:
        batch_op.drop_constraint(
            "fk_teammember_team",
            type_="foreignkey",
        )

    with op.batch_alter_table("tasks", schema=None) as batch_op:
        batch_op.drop_constraint(
            "fk_task_tournament",
            type_="foreignkey",
        )

        batch_op.drop_column("is_leaderboard_visible")
        batch_op.drop_column("max_score")
        batch_op.drop_column("min_reviews_per_submission")

    with op.batch_alter_table("submissions", schema=None) as batch_op:
        batch_op.drop_constraint(None, type_="foreignkey")
        batch_op.drop_column("task_id")

    with op.batch_alter_table("submission_urls", schema=None) as batch_op:
        batch_op.drop_column("value")

    with op.batch_alter_table("evaluations", schema=None) as batch_op:
        batch_op.drop_constraint(None, type_="foreignkey")
        batch_op.drop_column("updated_at")
        batch_op.drop_column("created_at")
        batch_op.drop_column("comment")
        batch_op.drop_column("assignment_id")

    op.create_table(
        "requirement_evaluations",
        sa.Column(
            "evaluation_id",
            sa.INTEGER(),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column(
            "score",
            sa.INTEGER(),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column(
            "id",
            sa.INTEGER(),
            autoincrement=True,
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["evaluation_id"],
            ["evaluations.id"],
            name=op.f("requirement_evaluations_evaluation_id_fkey"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint(
            "id",
            name=op.f("requirement_evaluations_pkey"),
        ),
    )

    op.create_table(
        "evaluation_requirements",
        sa.Column(
            "requirement_evaluation_id",
            sa.INTEGER(),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column(
            "requirement_id",
            sa.VARCHAR(),
            autoincrement=False,
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["requirement_evaluation_id"],
            ["requirement_evaluations.id"],
            name=op.f(
                "evaluation_requirements_requirement_evaluation_id_fkey"
            ),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["requirement_id"],
            ["task_requirement_options.name"],
            name=op.f(
                "evaluation_requirements_requirement_id_fkey"
            ),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint(
            "requirement_evaluation_id",
            "requirement_id",
            name=op.f("evaluation_requirements_pkey"),
        ),
    )

    op.drop_table("criterion_scores")
    op.drop_table("jury_assignments")
    op.drop_table("task_evaluation_criteria")
    op.drop_table("jury_assignment_statuses")