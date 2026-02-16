"""
Migration to add new columns to the tasks table for enhanced metadata.

This migration adds the following columns to support rich task metadata:
- priority: VARCHAR(20) with CHECK constraint for 'low', 'medium', 'high'
- due_date: TIMESTAMP WITH TIME ZONE
- tags: JSONB for storing array of tags
- recurrence_pattern: VARCHAR(50) for recurrence patterns
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


def upgrade():
    """
    Add new columns to tasks table.
    """
    # Add priority column with CHECK constraint
    op.execute("ALTER TABLE tasks ADD COLUMN priority VARCHAR(20)")
    op.execute("ALTER TABLE tasks ADD CONSTRAINT chk_priority CHECK (priority IN ('low', 'medium', 'high'))")

    # Add due_date column
    op.add_column('tasks', sa.Column('due_date', sa.DateTime(timezone=True), nullable=True))

    # Add tags column as JSONB
    op.add_column('tasks', sa.Column('tags', postgresql.JSONB(astext_type=sa.Text()), nullable=True))

    # Add recurrence_pattern column
    op.add_column('tasks', sa.Column('recurrence_pattern', sa.String(50), nullable=True))

    # Create indexes for better performance
    op.create_index('idx_tasks_priority', 'tasks', ['priority'])
    op.create_index('idx_tasks_due_date', 'tasks', ['due_date'])


def downgrade():
    """
    Remove new columns from tasks table.
    """
    # Drop indexes
    op.drop_index('idx_tasks_due_date')
    op.drop_index('idx_tasks_priority')

    # Drop columns
    op.drop_column('tasks', 'recurrence_pattern')
    op.drop_column('tasks', 'tags')
    op.drop_column('tasks', 'due_date')

    # Remove priority column and constraint
    op.execute("ALTER TABLE tasks DROP CONSTRAINT chk_priority")
    op.drop_column('tasks', 'priority')