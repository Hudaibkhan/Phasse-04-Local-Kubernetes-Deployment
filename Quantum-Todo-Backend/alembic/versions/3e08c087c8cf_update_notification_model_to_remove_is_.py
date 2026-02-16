"""Update notification model to remove is_read/read_at and add due_date

Revision ID: 3e08c087c8cf
Revises: ff9523091a45
Create Date: 2026-02-02 04:08:46.952570

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '3e08c087c8cf'
down_revision: Union[str, Sequence[str], None] = 'ff9523091a45'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Update notification table: remove is_read and read_at, add due_date
    op.add_column('notifications', sa.Column('due_date', sa.DateTime(), nullable=True))
    op.drop_column('notifications', 'read_at')
    op.drop_column('notifications', 'is_read')
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # Revert notification table: add back is_read and read_at, remove due_date
    op.add_column('notifications', sa.Column('is_read', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('notifications', sa.Column('read_at', sa.DateTime(), nullable=True))
    op.drop_column('notifications', 'due_date')
    # ### end Alembic commands ###
