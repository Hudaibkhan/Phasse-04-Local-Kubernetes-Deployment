# Import all models to ensure they're properly registered with SQLModel
from . import user
from . import tag
from . import task
from . import task_tag
from . import notification
from . import conversation
from . import message

# Make sure to import them in the right order to avoid circular dependency issues
# User, Tag, and Task models should be accessible here
__all__ = ['user', 'tag', 'task', 'task_tag', 'notification', 'conversation', 'message']