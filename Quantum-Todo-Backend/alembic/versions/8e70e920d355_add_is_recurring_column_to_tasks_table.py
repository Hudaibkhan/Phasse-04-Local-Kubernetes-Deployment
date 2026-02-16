"""Add is_recurring column to tasks table

Revision ID: 8e70e920d355
Revises: 946759ab3165
Create Date: 2026-01-18 15:20:23.646612

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '8e70e920d355'
down_revision: Union[str, Sequence[str], None] = '946759ab3165'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add the is_recurring column to tasks table
    # Note: This column might already exist from a previous migration, so we'll just add it
    op.add_column('tasks', sa.Column('is_recurring', sa.Boolean(), nullable=True, server_default=sa.text('false')))
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # Remove the is_recurring column
    op.drop_column('tasks', 'is_recurring')
    # ### end Alembic commands ###
