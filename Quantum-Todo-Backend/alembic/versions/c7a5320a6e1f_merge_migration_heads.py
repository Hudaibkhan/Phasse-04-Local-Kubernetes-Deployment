"""Merge migration heads

Revision ID: c7a5320a6e1f
Revises: 476430ebfce0, 476430ebfce1
Create Date: 2026-01-19 07:05:01.244473

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c7a5320a6e1f'
down_revision: Union[str, Sequence[str], None] = ('476430ebfce0', '476430ebfce1')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
