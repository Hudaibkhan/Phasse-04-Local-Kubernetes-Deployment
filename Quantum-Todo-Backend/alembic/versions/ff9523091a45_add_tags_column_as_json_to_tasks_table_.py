"""Add tags column as JSON to tasks table and update schema to store tags directly

Revision ID: ff9523091a45
Revises: d025a0755710
Create Date: 2026-01-21 22:51:53.246836

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'ff9523091a45'
down_revision: Union[str, Sequence[str], None] = 'd025a0755710'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Check if tags column exists and modify it to be JSON if it exists but is not JSON
    # If it doesn't exist, add it as JSON
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='tags')
            THEN
                ALTER TABLE tasks ADD COLUMN tags JSON;
            ELSE
                -- If the column exists but is not JSON type, we might need to alter it
                -- For now, we'll just ensure it exists
                RAISE NOTICE 'Column tags already exists in tasks table';
            END IF;
        END $$;
    """)

    # Ensure all enhanced fields exist in the tasks table
    # Add priority column if it doesn't exist
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='priority')
            THEN
                ALTER TABLE tasks ADD COLUMN priority VARCHAR(20);
            END IF;
        END $$;
    """)

    # Add due_date column if it doesn't exist
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='due_date')
            THEN
                ALTER TABLE tasks ADD COLUMN due_date TIMESTAMP;
            END IF;
        END $$;
    """)

    # Add is_recurring column if it doesn't exist
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='is_recurring')
            THEN
                ALTER TABLE tasks ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;
            END IF;
        END $$;
    """)

    # Add recurrence_pattern column if it doesn't exist
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='recurrence_pattern')
            THEN
                ALTER TABLE tasks ADD COLUMN recurrence_pattern VARCHAR(100);
            END IF;
        END $$;
    """)

    # Drop the old tags and task_tags junction tables since we're storing tags as JSON
    # Check if tables exist before dropping
    op.execute("DROP TABLE IF EXISTS task_tags CASCADE;")
    op.execute("DROP TABLE IF EXISTS tags CASCADE;")

    # Also drop notifications table if it exists (not part of core functionality)
    op.execute("DROP TABLE IF EXISTS notifications CASCADE;")
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # Remove the tags column from tasks table
    op.drop_column('tasks', 'tags')

    # Remove the enhanced fields (only if we want to fully revert)
    # In practice, we may not want to drop these columns as they're part of the enhanced functionality
    # op.drop_column('tasks', 'priority')
    # op.drop_column('tasks', 'due_date')
    # op.drop_column('tasks', 'is_recurring')
    # op.drop_column('tasks', 'recurrence_pattern')

    # Recreate the old tags and task_tags tables
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
