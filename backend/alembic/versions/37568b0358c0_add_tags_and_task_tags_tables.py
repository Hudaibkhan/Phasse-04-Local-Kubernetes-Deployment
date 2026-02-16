"""Add tags and task_tags tables

Revision ID: 37568b0358c0
Revises: 8e70e920d355
Create Date: 2026-01-18 15:35:42.412228

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '37568b0358c0'
down_revision: Union[str, Sequence[str], None] = '8e70e920d355'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Check if tags column exists before trying to drop it
    # Only drop the tags column if it exists (for backward compatibility)
    # The other enhanced fields should remain

    # Create tags table
    op.create_table('tags',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('color', sa.String(length=20), server_default='gray', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tags_user_id'), 'tags', ['user_id'], unique=False)

    # Create task_tags junction table
    op.create_table('task_tags',
        sa.Column('task_id', sa.Uuid(), nullable=False),
        sa.Column('tag_id', sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], ),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ),
        sa.PrimaryKeyConstraint('task_id', 'tag_id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # Drop task_tags junction table
    op.drop_table('task_tags')

    # Drop tags table
    op.drop_table('tags')
    op.drop_index(op.f('ix_tags_user_id'), table_name='tags')
    # ### end Alembic commands ###
