import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from sqlalchemy import create_engine, text
from backend.database.database import settings

engine = create_engine(settings.DATABASE_URL)

# Create the missing tags table
create_tags_sql = """
CREATE TABLE IF NOT EXISTS tags (
    id UUID NOT NULL,
    user_id UUID NOT NULL,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL DEFAULT 'gray',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(user_id) REFERENCES users (id)
);
"""

create_tags_index_sql = """
CREATE INDEX IF NOT EXISTS ix_tags_user_id ON tags (user_id);
"""

create_task_tags_sql = """
CREATE TABLE IF NOT EXISTS task_tags (
    task_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    PRIMARY KEY (task_id, tag_id),
    FOREIGN KEY(tag_id) REFERENCES tags (id),
    FOREIGN KEY(task_id) REFERENCES tasks (id)
);
"""

try:
    with engine.connect() as conn:
        trans = conn.begin()

        print("Creating tags table...")
        conn.execute(text(create_tags_sql))

        print("Creating index on tags table...")
        conn.execute(text(create_tags_index_sql))

        print("Creating task_tags junction table...")
        conn.execute(text(create_task_tags_sql))

        trans.commit()
        print("Tables created successfully!")

except Exception as e:
    print(f"Error creating tables: {e}")
    import traceback
    traceback.print_exc()