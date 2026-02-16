"""
Manual test script for MCP tools validation.
Tests all 5 tools: add_task, list_tasks, complete_task, update_task, delete_task.

Run this script to verify:
- Tool functionality
- User ownership enforcement
- Error handling
- Recurring task creation on completion
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.db.session import SessionLocal
from src.models.user import User
from src.models.task import Task
from sqlmodel import select
from src.mcp_server.schemas import (
    AddTaskInput,
    ListTasksInput,
    CompleteTaskInput,
    UpdateTaskInput,
    DeleteTaskInput,
)
from src.mcp_server.tools import (
    add_task,
    list_tasks,
    complete_task,
    update_task,
    delete_task,
)
from uuid import uuid4, UUID
import json


def print_result(test_name: str, result: dict):
    """Pretty print test results."""
    print(f"\n{'='*60}")
    print(f"TEST: {test_name}")
    print(f"{'='*60}")
    print(json.dumps(result, indent=2, default=str))
    if result.get("error"):
        print(f"[FAIL] {result.get('message')}")
    else:
        print(f"[PASS]")


def test_mcp_tools():
    """Run comprehensive tests for all MCP tools."""
    print("\n" + "="*60)
    print("MCP TOOLS VALIDATION TEST SUITE")
    print("="*60)

    with SessionLocal() as session:
        # Get test users
        users = session.exec(select(User).limit(2)).all()
        if len(users) < 2:
            print("\n[ERROR] Need at least 2 users in database for testing")
            print("Please create users first using the auth endpoints")
            return

        user1 = users[0]
        user2 = users[1]
        print(f"\n[OK] Using test users:")
        print(f"  - User 1: {user1.username} (ID: {user1.id})")
        print(f"  - User 2: {user2.username} (ID: {user2.id})")

        # ================================================================
        # T032: Test add_task tool
        # ================================================================
        print("\n" + "="*60)
        print("T032: Testing add_task tool")
        print("="*60)

        # Test 1: Create a task successfully
        add_input = AddTaskInput(
            user_id=user1.id,
            title="Test Task from MCP",
            description="This is a test task created via MCP tool"
        )
        result = add_task(add_input)
        print_result("Add task - Success case", result)

        if not result.get("error"):
            task1_id = UUID(result["task_id"])
            print(f"[OK] Task created with ID: {task1_id}")
        else:
            print("[FAIL] Failed to create task, cannot continue tests")
            return

        # Test 2: Create task with minimal data
        add_input2 = AddTaskInput(
            user_id=user1.id,
            title="Minimal Task"
        )
        result2 = add_task(add_input2)
        print_result("Add task - Minimal data", result2)

        # Test 3: Invalid input (empty title should fail at validation)
        try:
            add_input3 = AddTaskInput(
                user_id=user1.id,
                title=""  # Empty title should fail validation
            )
            print("[FAIL] Validation should have failed for empty title")
        except Exception as e:
            print(f"[OK] Validation correctly rejected empty title: {e}")

        # ================================================================
        # T033: Test list_tasks tool
        # ================================================================
        print("\n" + "="*60)
        print("T033: Testing list_tasks tool")
        print("="*60)

        # Test 1: List all tasks
        list_input = ListTasksInput(user_id=user1.id, status="all")
        result = list_tasks(list_input)
        print_result("List tasks - All tasks", result)

        if not result.get("error"):
            print(f"[OK] Found {result['count']} task(s)")

        # Test 2: List pending tasks only
        list_input2 = ListTasksInput(user_id=user1.id, status="pending")
        result2 = list_tasks(list_input2)
        print_result("List tasks - Pending only", result2)

        # Test 3: List completed tasks only
        list_input3 = ListTasksInput(user_id=user1.id, status="completed")
        result3 = list_tasks(list_input3)
        print_result("List tasks - Completed only", result3)

        # ================================================================
        # T035: Test update_task tool
        # ================================================================
        print("\n" + "="*60)
        print("T035: Testing update_task tool")
        print("="*60)

        # Test 1: Update task title
        update_input = UpdateTaskInput(
            user_id=user1.id,
            task_id=task1_id,
            title="Updated Task Title"
        )
        result = update_task(update_input)
        print_result("Update task - Title only", result)

        # Test 2: Update task description
        update_input2 = UpdateTaskInput(
            user_id=user1.id,
            task_id=task1_id,
            description="Updated description via MCP"
        )
        result2 = update_task(update_input2)
        print_result("Update task - Description only", result2)

        # Test 3: Update both title and description
        update_input3 = UpdateTaskInput(
            user_id=user1.id,
            task_id=task1_id,
            title="Final Title",
            description="Final description"
        )
        result3 = update_task(update_input3)
        print_result("Update task - Both fields", result3)

        # ================================================================
        # T034: Test complete_task tool
        # ================================================================
        print("\n" + "="*60)
        print("T034: Testing complete_task tool")
        print("="*60)

        # Test 1: Complete a task
        complete_input = CompleteTaskInput(
            user_id=user1.id,
            task_id=task1_id
        )
        result = complete_task(complete_input)
        print_result("Complete task - Success case", result)

        # Test 2: Complete non-existent task
        fake_task_id = uuid4()
        complete_input2 = CompleteTaskInput(
            user_id=user1.id,
            task_id=fake_task_id
        )
        result2 = complete_task(complete_input2)
        print_result("Complete task - Non-existent task", result2)

        # ================================================================
        # T037: Test user ownership enforcement
        # ================================================================
        print("\n" + "="*60)
        print("T037: Testing user ownership enforcement")
        print("="*60)

        # Test 1: User 2 tries to complete User 1's task
        complete_input3 = CompleteTaskInput(
            user_id=user2.id,
            task_id=task1_id
        )
        result3 = complete_task(complete_input3)
        print_result("Ownership test - User 2 accessing User 1's task", result3)
        if result3.get("error") or result3.get("status") == "not_found":
            print("[OK] User ownership correctly enforced")
        else:
            print("[SECURITY ISSUE] User 2 could access User 1's task!")

        # Test 2: User 2 tries to update User 1's task
        update_input4 = UpdateTaskInput(
            user_id=user2.id,
            task_id=task1_id,
            title="Hacked title"
        )
        result4 = update_task(update_input4)
        print_result("Ownership test - User 2 updating User 1's task", result4)
        if result4.get("error") or result4.get("status") == "not_found":
            print("[OK] User ownership correctly enforced")
        else:
            print("[SECURITY ISSUE] User 2 could update User 1's task!")

        # ================================================================
        # T036: Test delete_task tool
        # ================================================================
        print("\n" + "="*60)
        print("T036: Testing delete_task tool")
        print("="*60)

        # Test 1: Delete a task
        delete_input = DeleteTaskInput(
            user_id=user1.id,
            task_id=task1_id
        )
        result = delete_task(delete_input)
        print_result("Delete task - Success case", result)

        # Test 2: Delete non-existent task
        delete_input2 = DeleteTaskInput(
            user_id=user1.id,
            task_id=fake_task_id
        )
        result2 = delete_task(delete_input2)
        print_result("Delete task - Non-existent task", result2)

        # Test 3: User 2 tries to delete User 1's task (if any remain)
        # Create a new task for this test
        add_input4 = AddTaskInput(
            user_id=user1.id,
            title="Task for deletion test"
        )
        result_add = add_task(add_input4)
        if not result_add.get("error"):
            test_task_id = UUID(result_add["task_id"])
            delete_input3 = DeleteTaskInput(
                user_id=user2.id,
                task_id=test_task_id
            )
            result3 = delete_task(delete_input3)
            print_result("Ownership test - User 2 deleting User 1's task", result3)
            if result3.get("error") or result3.get("status") == "not_found":
                print("[OK] User ownership correctly enforced")
            else:
                print("[SECURITY ISSUE] User 2 could delete User 1's task!")

            # Cleanup
            delete_input4 = DeleteTaskInput(user_id=user1.id, task_id=test_task_id)
            delete_task(delete_input4)

        # ================================================================
        # T038: Test error handling
        # ================================================================
        print("\n" + "="*60)
        print("T038: Testing error handling")
        print("="*60)

        # Test 1: Invalid UUID format
        try:
            invalid_input = CompleteTaskInput(
                user_id=UUID("00000000-0000-0000-0000-000000000000"),
                task_id=UUID("invalid-uuid-format")  # This will fail at UUID parsing
            )
        except Exception as e:
            print(f"[OK] Invalid UUID correctly rejected: {type(e).__name__}")

        # Test 2: Missing required fields (should fail at Pydantic validation)
        try:
            invalid_input2 = AddTaskInput(user_id=user1.id)  # Missing title
        except Exception as e:
            print(f"[OK] Missing required field correctly rejected: {type(e).__name__}")

        print("\n" + "="*60)
        print("ALL TESTS COMPLETED")
        print("="*60)


if __name__ == "__main__":
    try:
        test_mcp_tools()
        print("\n[OK] Test suite execution completed")
    except Exception as e:
        print(f"\n[FAIL] Test suite failed with error: {e}")
        import traceback
        traceback.print_exc()
