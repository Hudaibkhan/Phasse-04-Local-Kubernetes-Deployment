from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import sys
import os

# Add the src directory to the path so we can import the models and settings
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'src'))

# Import the settings and models
from src.db.session import settings
from src.models.user import User
from src.models.task import Task
from src.models.notification import Notification

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Add the model's MetaData object here for 'autogenerate' support
from sqlalchemy.schema import MetaData

# Create a new MetaData instance and collect all tables from all models
from sqlalchemy.schema import MetaData

def get_combined_metadata():
    # Create a new metadata object with merged tables
    combined_tables = {}
    combined_tables.update(User.metadata.tables)
    combined_tables.update(Task.metadata.tables)
    combined_tables.update(Notification.metadata.tables)

    combined_metadata = MetaData()
    # Add tables to the new metadata
    for table_name, table in combined_tables.items():
        combined_metadata._add_table(table_name, table.schema, table)

    return combined_metadata

target_metadata = get_combined_metadata()

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    # Use the database URL from settings
    connectable = engine_from_config(
        {"sqlalchemy.url": settings.DATABASE_URL},
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()