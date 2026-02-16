"""
MCP Server for Quantum Todo Backend.
Provides 5 task management tools via Model Context Protocol.
"""
import logging
from typing import Any
from mcp.server import Server
from mcp.types import Tool, TextContent
from pydantic import ValidationError

from .schemas import (
    AddTaskInput,
    ListTasksInput,
    CompleteTaskInput,
    UpdateTaskInput,
    DeleteTaskInput,
)
from .tools import (
    add_task,
    list_tasks,
    complete_task,
    update_task,
    delete_task,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize MCP server
app = Server("quantum-todo-mcp")


@app.list_tools()
async def list_tools() -> list[Tool]:
    """
    List all available MCP tools for task management.

    Returns:
        List of Tool definitions with schemas
    """
    return [
        Tool(
            name="add_task",
            description="Create a new task for a user",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "format": "uuid",
                        "description": "UUID of the user creating the task"
                    },
                    "title": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 200,
                        "description": "Task title"
                    },
                    "description": {
                        "type": "string",
                        "maxLength": 1000,
                        "description": "Optional task description"
                    }
                },
                "required": ["user_id", "title"]
            }
        ),
        Tool(
            name="list_tasks",
            description="List tasks for a user with optional status filtering",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "format": "uuid",
                        "description": "UUID of the user whose tasks to retrieve"
                    },
                    "status": {
                        "type": "string",
                        "enum": ["all", "pending", "completed"],
                        "default": "all",
                        "description": "Filter by status: all, pending, or completed"
                    }
                },
                "required": ["user_id"]
            }
        ),
        Tool(
            name="complete_task",
            description="Mark a task as completed (handles recurring tasks automatically)",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "format": "uuid",
                        "description": "UUID of the user who owns the task"
                    },
                    "task_id": {
                        "type": "string",
                        "format": "uuid",
                        "description": "UUID of the task to complete"
                    }
                },
                "required": ["user_id", "task_id"]
            }
        ),
        Tool(
            name="update_task",
            description="Update a task's title and/or description",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "format": "uuid",
                        "description": "UUID of the user who owns the task"
                    },
                    "task_id": {
                        "type": "string",
                        "format": "uuid",
                        "description": "UUID of the task to update"
                    },
                    "title": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 200,
                        "description": "New task title"
                    },
                    "description": {
                        "type": "string",
                        "maxLength": 1000,
                        "description": "New task description"
                    }
                },
                "required": ["user_id", "task_id"]
            }
        ),
        Tool(
            name="delete_task",
            description="Delete a task",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "format": "uuid",
                        "description": "UUID of the user who owns the task"
                    },
                    "task_id": {
                        "type": "string",
                        "format": "uuid",
                        "description": "UUID of the task to delete"
                    }
                },
                "required": ["user_id", "task_id"]
            }
        ),
    ]


@app.call_tool()
async def call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
    """
    Handle tool invocation with input validation and error handling.

    Args:
        name: Tool name to invoke
        arguments: Tool arguments as dictionary

    Returns:
        List of TextContent with JSON response

    Raises:
        ValueError: If tool name is unknown or validation fails
    """
    try:
        # Route to appropriate tool handler with validation
        if name == "add_task":
            input_data = AddTaskInput(**arguments)
            result = add_task(input_data)

        elif name == "list_tasks":
            input_data = ListTasksInput(**arguments)
            result = list_tasks(input_data)

        elif name == "complete_task":
            input_data = CompleteTaskInput(**arguments)
            result = complete_task(input_data)

        elif name == "update_task":
            input_data = UpdateTaskInput(**arguments)
            result = update_task(input_data)

        elif name == "delete_task":
            input_data = DeleteTaskInput(**arguments)
            result = delete_task(input_data)

        else:
            raise ValueError(f"Unknown tool: {name}")

        # Log successful invocation
        logger.info(f"Tool '{name}' executed successfully")

        # Return result as TextContent with JSON
        import json
        return [TextContent(type="text", text=json.dumps(result, indent=2))]

    except ValidationError as e:
        # Handle Pydantic validation errors
        logger.error(f"Validation error in tool '{name}': {e}")
        error_response = {
            "error": True,
            "message": f"Invalid input: {str(e)}",
            "status": "validation_error"
        }
        import json
        return [TextContent(type="text", text=json.dumps(error_response, indent=2))]

    except Exception as e:
        # Handle unexpected errors
        logger.error(f"Error executing tool '{name}': {e}", exc_info=True)
        error_response = {
            "error": True,
            "message": f"Tool execution failed: {str(e)}",
            "status": "error"
        }
        import json
        return [TextContent(type="text", text=json.dumps(error_response, indent=2))]


# Entry point for running the MCP server
async def main():
    """
    Main entry point for the MCP server.
    Starts the server and listens for tool invocations.
    """
    from mcp.server.stdio import stdio_server

    async with stdio_server() as (read_stream, write_stream):
        logger.info("Quantum Todo MCP Server starting...")
        await app.run(
            read_stream,
            write_stream,
            app.create_initialization_options()
        )


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
