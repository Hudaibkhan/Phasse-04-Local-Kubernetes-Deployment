"""
Tool registry for MCP tools with user context injection.
"""
from uuid import UUID
import json
import logging
from typing import Dict, Any

from src.mcp_server.tools import (
    add_task, list_tasks, complete_task, update_task, delete_task
)
from src.mcp_server.schemas import (
    AddTaskInput, ListTasksInput, CompleteTaskInput,
    UpdateTaskInput, DeleteTaskInput
)

logger = logging.getLogger(__name__)

# Tool schemas for OpenAI Assistants API
TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "add_task",
            "description": "Create a new task with a title and optional description",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Task title (e.g., 'Buy groceries', 'Finish report')"
                    },
                    "description": {
                        "type": "string",
                        "description": "Optional detailed description of the task"
                    }
                },
                "required": ["title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_tasks",
            "description": "Retrieve tasks, optionally filtered by status or search term",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["pending", "completed", "all"],
                        "description": "Filter by completion status (default: all)"
                    },
                    "search": {
                        "type": "string",
                        "description": "Optional search term to filter tasks by title"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "complete_task",
            "description": "Mark a task as completed",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "UUID of the task to complete"
                    }
                },
                "required": ["task_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_task",
            "description": "Update a task's title or description",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "UUID of the task to update"
                    },
                    "title": {
                        "type": "string",
                        "description": "New task title (optional)"
                    },
                    "description": {
                        "type": "string",
                        "description": "New task description (optional)"
                    }
                },
                "required": ["task_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_task",
            "description": "Permanently delete a task",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "UUID of the task to delete"
                    }
                },
                "required": ["task_id"]
            }
        }
    }
]


def invoke_mcp_tool_with_user_context(
    tool_name: str,
    arguments: Dict[str, Any],
    user_id: UUID
) -> Dict[str, Any]:
    """
    Invoke MCP tool with user_id context injected.

    Args:
        tool_name: Name of the MCP tool to invoke
        arguments: Tool arguments from assistant (without user_id)
        user_id: Authenticated user's ID from JWT token

    Returns:
        Tool result as dictionary (JSON-serializable)
    """
    try:
        if tool_name == "add_task":
            input_data = AddTaskInput(
                user_id=user_id,
                title=arguments["title"],
                description=arguments.get("description")
            )
            return add_task(input_data)

        elif tool_name == "list_tasks":
            input_data = ListTasksInput(
                user_id=user_id,
                status=arguments.get("status", "all"),
                search=arguments.get("search")
            )
            return list_tasks(input_data)

        elif tool_name == "complete_task":
            input_data = CompleteTaskInput(
                user_id=user_id,
                task_id=UUID(arguments["task_id"])
            )
            return complete_task(input_data)

        elif tool_name == "update_task":
            input_data = UpdateTaskInput(
                user_id=user_id,
                task_id=UUID(arguments["task_id"]),
                title=arguments.get("title"),
                description=arguments.get("description")
            )
            return update_task(input_data)

        elif tool_name == "delete_task":
            input_data = DeleteTaskInput(
                user_id=user_id,
                task_id=UUID(arguments["task_id"])
            )
            return delete_task(input_data)

        else:
            logger.error(f"Unknown tool: {tool_name}")
            return {
                "error": True,
                "message": f"Unknown tool: {tool_name}"
            }

    except ValueError as e:
        logger.error(f"Invalid UUID in tool {tool_name}: {str(e)}")
        return {
            "error": True,
            "message": f"Invalid task ID format: {str(e)}"
        }
    except Exception as e:
        logger.error(f"Tool invocation error: {tool_name}, {str(e)}")
        return {
            "error": True,
            "message": "Failed to execute operation"
        }
