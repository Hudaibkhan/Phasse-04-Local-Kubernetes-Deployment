"""create user task and session tables for auth and persistence

Revision ID: d8bb32329d9d
Revises: 81eec9f7197a
Create Date: 2026-01-14 03:42:59.733899

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'd8bb32329d9d'
down_revision: Union[str, Sequence[str], None] = '81eec9f7197a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add username column to users table
    op.add_column('users', sa.Column('username', sa.String(), nullable=True))

    # Create unique constraint for username
    op.create_unique_constraint('uq_users_username', 'users', ['username'])

    # Ensure email remains unique
    op.create_unique_constraint('uq_users_email', 'users', ['email'])

    # Create sessions table
    op.create_table('sessions',
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('token', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token')
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop sessions table
    op.drop_table('sessions')

    # Drop email unique constraint
    op.drop_constraint('uq_users_email', 'users', type_='unique')

    # Drop username unique constraint
    op.drop_constraint('uq_users_username', 'users', type_='unique')

    # Drop username column
    op.drop_column('users', 'username')
