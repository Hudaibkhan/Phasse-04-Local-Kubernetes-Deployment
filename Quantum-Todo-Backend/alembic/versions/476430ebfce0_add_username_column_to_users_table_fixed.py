"""Add username column to users table

Revision ID: 476430ebfce1
Revises: 37568b0358c0
Create Date: 2026-01-19 03:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '476430ebfce1'
down_revision: Union[str, Sequence[str], None] = '37568b0358c0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add the username column to users table
    op.add_column('users', sa.Column('username', sa.String(50), nullable=True))

    # Update existing users with a default username based on their email
    connection = op.get_bind()
    connection.execute(sa.text("""
        UPDATE users
        SET username = SUBSTRING(email FROM 1 FOR POSITION('@' IN email) - 1)
        WHERE username IS NULL OR username = '';
    """))

    # Create unique index for username (after populating values)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    # Make the username column non-nullable
    op.alter_column('users', 'username', nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Remove the username column from users table
    op.drop_column('users', 'username')