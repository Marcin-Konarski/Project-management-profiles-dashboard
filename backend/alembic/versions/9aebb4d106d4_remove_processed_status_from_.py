"""Remove PROCESSED status from DocumentStatus enum

Revision ID: 9aebb4d106d4
Revises: e775848fbcf9
Create Date: 2026-03-23 09:38:19.224656

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "9aebb4d106d4"
down_revision: Union[str, Sequence[str], None] = "e775848fbcf9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Remove PROCESSED value from documentstatus enum."""
    op.execute("ALTER TYPE documentstatus RENAME TO documentstatus_old")
    op.execute("CREATE TYPE documentstatus AS ENUM ('PENDING', 'UPLOADED', 'FAILED')")
    op.execute(
        "ALTER TABLE document "
        "ALTER COLUMN status TYPE documentstatus "
        "USING status::text::documentstatus"
    )
    op.execute("DROP TYPE documentstatus_old")


def downgrade() -> None:
    """Re-add PROCESSED value to documentstatus enum."""
    op.execute("ALTER TYPE documentstatus RENAME TO documentstatus_old")
    op.execute(
        "CREATE TYPE documentstatus AS ENUM ('PENDING', 'UPLOADED', 'PROCESSED', 'FAILED')"
    )
    op.execute(
        "ALTER TABLE document "
        "ALTER COLUMN status TYPE documentstatus "
        "USING status::text::documentstatus"
    )
    op.execute("DROP TYPE documentstatus_old")
