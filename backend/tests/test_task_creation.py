import pytest
from sqlmodel import Session
from backend.src.schemas.task import TaskCreate
from backend.src.services.task_service import TaskService


@pytest.fixture
def db_session():
    """Mock database session for testing."""
    # In a real test, this would connect to a test database
    pass


def test_create_task_with_all_metadata_fields(db_session):
    """Test task creation with all enhanced metadata fields."""
    task_service = TaskService()

    task_data = TaskCreate(
        title="Test Task with Metadata",
        description="This is a test task with all metadata fields",
        priority="high",
        due_date="2026-12-31T23:59:59",
        tags=["testing", "metadata", "enhancement"],
        recurrence_pattern="weekly",
        completed=False
    )

    # Create task (user_id would be provided in real scenario)
    created_task = task_service.create_task(db_session, task_data, user_id=1)

    # Assert all fields are correctly set
    assert created_task.title == "Test Task with Metadata"
    assert created_task.description == "This is a test task with all metadata fields"
    assert created_task.priority == "high"
    assert created_task.due_date is not None
    assert "testing" in created_task.tags
    assert "metadata" in created_task.tags
    assert "enhancement" in created_task.tags
    assert created_task.recurrence_pattern == "weekly"
    assert created_task.completed is False

    print("✅ Task creation with all metadata fields test passed")


def test_retrieve_task_with_all_metadata_fields(db_session):
    """Test retrieving a task with all metadata fields."""
    task_service = TaskService()

    # Create a task first
    task_data = TaskCreate(
        title="Test Retrieval Task",
        description="Task for testing retrieval",
        priority="medium",
        due_date="2026-06-15T10:30:00",
        tags=["retrieval", "test"],
        recurrence_pattern="daily",
        completed=False
    )

    created_task = task_service.create_task(db_session, task_data, user_id=1)

    # Retrieve the task
    retrieved_task = task_service.get_task_by_id(db_session, created_task.id, user_id=1)

    # Assert all fields are correctly retrieved
    assert retrieved_task.id == created_task.id
    assert retrieved_task.title == "Test Retrieval Task"
    assert retrieved_task.description == "Task for testing retrieval"
    assert retrieved_task.priority == "medium"
    assert retrieved_task.due_date is not None
    assert "retrieval" in retrieved_task.tags
    assert "test" in retrieved_task.tags
    assert retrieved_task.recurrence_pattern == "daily"
    assert retrieved_task.completed is False

    print("✅ Task retrieval with all metadata fields test passed")


if __name__ == "__main__":
    # These would normally run via pytest
    test_create_task_with_all_metadata_fields(None)
    test_retrieve_task_with_all_metadata_fields(None)
    print("\n🎉 All User Story 1 backend tests passed!")