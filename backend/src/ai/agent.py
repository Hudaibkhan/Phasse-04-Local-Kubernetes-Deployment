"""
OpenAI Agents SDK agent for natural language task management.

This module uses the official OpenAI Agents SDK with Gemini as the LLM provider
through OpenAI-compatible endpoints, with Groq as a fallback.
"""
import logging
from uuid import UUID
from typing import Dict, Any
from agents import Agent, Runner, function_tool, RunContextWrapper
from pydantic import BaseModel, Field

from .connection import config, fallback_config
from src.mcp_server.tools import (
    add_task, list_tasks, complete_task, update_task, delete_task
)
from src.mcp_server.schemas import (
    AddTaskInput, ListTasksInput, CompleteTaskInput,
    UpdateTaskInput, DeleteTaskInput
)

logger = logging.getLogger(__name__)


# Tool input schemas for validation
class AddTaskArgs(BaseModel):
    title: str = Field(..., description="Task title (concise, e.g., 'Buy BMW', 'Walk daily')")
    description: str | None = Field(None, description="Detailed description of the task")
    due_date: str | None = Field(None, description="Due date in YYYY-MM-DD format (e.g., '2027-01-01')")
    tags: list[str] | None = Field(None, description="List of relevant tags/keywords (e.g., ['car', 'black'])")
    priority: str | None = Field(None, description="Priority level: 'low', 'medium', or 'high'")
    is_recurring: bool | None = Field(None, description="Whether this is a recurring task (e.g., daily, weekly)")
    recurrence_pattern: str | None = Field(None, description="Recurrence pattern: 'daily', 'weekly', 'monthly', 'yearly'")


class ListTasksArgs(BaseModel):
    status: str = Field("all", description="Filter by completion status: pending, completed, or all")
    search: str | None = Field(None, description="Optional search term to filter tasks by title")


class CompleteTaskArgs(BaseModel):
    task_id: str = Field(..., description="UUID of the task to complete")


class UpdateTaskArgs(BaseModel):
    task_id: str = Field(..., description="UUID of the task to update")
    title: str | None = Field(None, description="New task title (optional)")
    description: str | None = Field(None, description="New task description (optional)")


class DeleteTaskArgs(BaseModel):
    task_id: str = Field(..., description="UUID of the task to delete")


# Define MCP tools using @function_tool decorator
@function_tool
def add_task_tool(ctx: RunContextWrapper[UUID], args: AddTaskArgs) -> Dict[str, Any]:
    """Create a new task with intelligent parsing of natural language details.

    Extracts structured information from user input including:
    - Title and description
    - Due dates (from phrases like "in 2027", "next week")
    - Tags (keywords like colors, categories)
    - Priority (inferred from urgency/tone)
    - Recurrence (from phrases like "daily", "every week")
    """
    try:
        user_id = ctx.context

        # Build input data with all available fields
        input_data = {
            "user_id": user_id,
            "title": args.title,
            "description": args.description,
            "due_date": args.due_date,
            "tags": args.tags or [],
            "priority": args.priority or "medium",
            "is_recurring": args.is_recurring or False,
            "recurrence_pattern": args.recurrence_pattern
        }

        # Call the enhanced add_task function
        from src.mcp_server.tools.add_task import add_task_enhanced
        result = add_task_enhanced(input_data)

        logger.info(f"Task added for user {user_id}: {args.title} (priority: {args.priority}, recurring: {args.is_recurring})")
        return result
    except Exception as e:
        logger.error(f"Error adding task: {str(e)}")
        return {"error": True, "message": "Failed to add task"}


@function_tool
def list_tasks_tool(ctx: RunContextWrapper[UUID], args: ListTasksArgs) -> Dict[str, Any]:
    """Retrieve tasks, optionally filtered by status or search term."""
    try:
        user_id = ctx.context
        input_data = ListTasksInput(
            user_id=user_id,
            status=args.status,
            search=args.search
        )
        result = list_tasks(input_data)
        logger.info(f"Tasks listed for user {user_id}: {args.status} status")
        return result
    except Exception as e:
        logger.error(f"Error listing tasks: {str(e)}")
        return {"error": True, "message": "Failed to list tasks"}


@function_tool
def complete_task_tool(ctx: RunContextWrapper[UUID], args: CompleteTaskArgs) -> Dict[str, Any]:
    """Mark a task as completed."""
    try:
        user_id = ctx.context
        input_data = CompleteTaskInput(
            user_id=user_id,
            task_id=UUID(args.task_id)
        )
        result = complete_task(input_data)
        logger.info(f"Task completed for user {user_id}: {args.task_id}")
        return result
    except ValueError as e:
        logger.error(f"Invalid UUID: {str(e)}")
        return {"error": True, "message": "Invalid task ID format"}
    except Exception as e:
        logger.error(f"Error completing task: {str(e)}")
        return {"error": True, "message": "Failed to complete task"}


@function_tool
def update_task_tool(ctx: RunContextWrapper[UUID], args: UpdateTaskArgs) -> Dict[str, Any]:
    """Update a task's title or description."""
    try:
        user_id = ctx.context
        input_data = UpdateTaskInput(
            user_id=user_id,
            task_id=UUID(args.task_id),
            title=args.title,
            description=args.description
        )
        result = update_task(input_data)
        logger.info(f"Task updated for user {user_id}: {args.task_id}")
        return result
    except ValueError as e:
        logger.error(f"Invalid UUID: {str(e)}")
        return {"error": True, "message": "Invalid task ID format"}
    except Exception as e:
        logger.error(f"Error updating task: {str(e)}")
        return {"error": True, "message": "Failed to update task"}


@function_tool
def delete_task_tool(ctx: RunContextWrapper[UUID], args: DeleteTaskArgs) -> Dict[str, Any]:
    """Permanently delete a task."""
    try:
        user_id = ctx.context
        input_data = DeleteTaskInput(
            user_id=user_id,
            task_id=UUID(args.task_id)
        )
        result = delete_task(input_data)
        logger.info(f"Task deleted for user {user_id}: {args.task_id}")
        return result
    except ValueError as e:
        logger.error(f"Invalid UUID: {str(e)}")
        return {"error": True, "message": "Invalid task ID format"}
    except Exception as e:
        logger.error(f"Error deleting task: {str(e)}")
        return {"error": True, "message": "Failed to delete task"}


# Create the task management agent
task_agent = Agent(
    name="Quantum Todo Assistant",
    instructions="""You are an intelligent task management assistant for Evolution Todo.

You help users manage their tasks through natural language commands with smart parsing capabilities.

**INTELLIGENT TASK CREATION:**
When users describe tasks, extract ALL relevant information:

1. **Title**: Create a concise, actionable title (2-5 words)
   - "I want to buy BMW car" → title: "Buy BMW"
   - "I walk daily" → title: "Daily walk"

2. **Description**: Include full context and details
   - Extract purpose, context, and specifics from user's message

3. **Due Date**: Parse temporal references intelligently
   - "in 2027" → "2027-01-01" (start of year)
   - "next month" → calculate next month's first day
   - "by Friday" → calculate next Friday's date
   - If year only mentioned, use January 1st of that year
   - If no date mentioned, leave as null

4. **Tags**: Extract relevant keywords and attributes
   - Colors: "black", "red", "blue"
   - Categories: "car", "work", "personal", "health"
   - Any descriptive words that categorize the task

5. **Priority**: Infer from urgency and tone
   - Urgent words ("ASAP", "urgent", "immediately") → "high"
   - Casual tone, future dates → "low"
   - Default → "medium"

6. **Recurrence**: Detect recurring patterns
   - "daily", "every day" → is_recurring: true, pattern: "daily"
   - "weekly", "every week" → is_recurring: true, pattern: "weekly"
   - "monthly" → is_recurring: true, pattern: "monthly"
   - "yearly", "annually" → is_recurring: true, pattern: "yearly"
   - If no pattern mentioned → is_recurring: false

**EXAMPLES:**
User: "I want to buy BMW car at 2027 in black colour for drifting"
→ title: "Buy BMW"
→ description: "Buy BMW car in black colour for drifting"
→ due_date: "2027-01-01"
→ tags: ["car", "black", "BMW"]
→ priority: "medium"
→ is_recurring: false

User: "I walk daily"
→ title: "Daily walk"
→ description: "Daily walking routine"
→ due_date: null
→ tags: ["health", "exercise"]
→ priority: "medium"
→ is_recurring: true
→ recurrence_pattern: "daily"

User: "Buy groceries ASAP"
→ title: "Buy groceries"
→ description: "Purchase groceries urgently"
→ due_date: null (or today's date)
→ tags: ["shopping"]
→ priority: "high"
→ is_recurring: false

**TASK LISTING:**
When users ask to see tasks, use list_tasks_tool with appropriate filters:
- "show my tasks" → status: "all"
- "show pending tasks" → status: "pending"
- "show completed tasks" → status: "completed"
- "find tasks about BMW" → search: "BMW"

**TASK REFERENCE HANDLING:**
- When users reference tasks by name, use list_tasks_tool to find the task ID first
- If multiple tasks match, ask the user to clarify
- If a task is not found, offer to show current tasks

**ERROR HANDLING:**
- If a task ID doesn't exist, respond helpfully
- If an operation fails, explain in simple terms
- Never expose technical error details

Keep responses concise, friendly, and helpful.""",
    tools=[
        add_task_tool,
        list_tasks_tool,
        complete_task_tool,
        update_task_tool,
        delete_task_tool
    ]
)


async def process_message(message: str, user_id: UUID) -> Dict[str, Any]:
    """
    Process user message with AI agent using OpenAI Agents SDK.

    Args:
        message: Natural language input from user
        user_id: Authenticated user's ID

    Returns:
        Dictionary with 'response' and optional 'tool_calls'
    """
    # Validate input
    if not message or not message.strip():
        logger.warning(f"Empty message received from user {user_id}")
        return {
            "response": "I didn't receive a message. What would you like me to help you with?",
            "tool_calls": []
        }

    if len(message) > 2000:
        logger.warning(f"Message too long from user {user_id}: {len(message)} characters")
        return {
            "response": "Your message is too long. Please keep it under 2000 characters.",
            "tool_calls": []
        }

    try:
        logger.info(f"Processing message for user {user_id}: {message[:100]}...")

        # Try with primary LLM (Gemini)
        try:
            result = await Runner.run(
                task_agent,
                message,
                context=user_id,
                run_config=config
            )
            logger.info(f"Used primary LLM for user {user_id}")
        except Exception as primary_error:
            # If primary fails and fallback is available, try fallback
            if fallback_config:
                logger.warning(f"Primary LLM failed for user {user_id}, trying fallback: {str(primary_error)}")
                result = await Runner.run(
                    task_agent,
                    message,
                    context=user_id,
                    run_config=fallback_config
                )
                logger.info(f"Used fallback LLM (Groq) for user {user_id}")
            else:
                # No fallback available, re-raise the error
                raise primary_error

        # Extract response
        response_text = result.final_output

        # Extract tool calls for logging
        tool_calls_log = []
        if hasattr(result, 'tool_calls') and result.tool_calls:
            for tool_call in result.tool_calls:
                tool_calls_log.append({
                    "tool": tool_call.name if hasattr(tool_call, 'name') else "unknown",
                    "arguments": tool_call.arguments if hasattr(tool_call, 'arguments') else {},
                    "result": tool_call.result if hasattr(tool_call, 'result') else None
                })

        logger.info(f"Agent response for user {user_id}: {response_text[:100]}...")

        return {
            "response": response_text,
            "tool_calls": tool_calls_log
        }

    except Exception as e:
        logger.error(f"Error processing message for user {user_id}: {str(e)}", exc_info=True)

        # Check if it's a rate limit error
        error_str = str(e).lower()
        if '429' in error_str or 'rate limit' in error_str or 'quota' in error_str:
            return {
                "error": True,
                "message": "API rate limit reached. Please try again in a few moments."
            }

        # Check if it's a fallback compatibility error
        if 'tool' in error_str and ('400' in error_str or 'validation' in error_str):
            return {
                "error": True,
                "message": "The AI service is temporarily unavailable. Please try again later or use simpler commands."
            }

        return {
            "error": True,
            "message": "I encountered an unexpected issue. Please try again later."
        }
