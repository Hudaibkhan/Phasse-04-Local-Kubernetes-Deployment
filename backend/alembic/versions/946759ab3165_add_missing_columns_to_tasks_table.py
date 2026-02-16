"""Add missing columns to tasks table

Revision ID: 946759ab3165
Revises: e77283735eac
Create Date: 2026-01-17 23:24:04.684162

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '946759ab3165'
down_revision: Union[str, Sequence[str], None] = 'e77283735eac'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add missing columns to tasks table
    op.add_column('tasks', sa.Column('priority', sa.String(length=20), nullable=True))
    op.add_column('tasks', sa.Column('due_date', sa.DateTime(), nullable=True))
    op.add_column('tasks', sa.Column('is_recurring', sa.Boolean(), nullable=True, server_default=sa.text('false')))
    op.add_column('tasks', sa.Column('recurrence_pattern', sa.String(length=100), nullable=True))
    # NOTE: tags are now handled via the task_tags junction table, not as a column in tasks table
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # Remove the columns we added in upgrade
    op.drop_column('tasks', 'recurrence_pattern')
    op.drop_column('tasks', 'is_recurring')
    op.drop_column('tasks', 'due_date')
    op.drop_column('tasks', 'priority')
    # NOTE: tags were not added as a column in this migration, so we don't drop it here
    # ### end Alembic commands ###
