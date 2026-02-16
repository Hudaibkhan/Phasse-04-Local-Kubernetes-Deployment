"""
Test script for OpenAI Agents SDK + Gemini integration.

This script tests the agent without requiring the full FastAPI server.
"""
import asyncio
import sys
from uuid import uuid4
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from src.ai.agent import process_message


async def test_agent():
    """Test the agent with sample messages."""

    # Use a test user ID
    test_user_id = uuid4()

    print("=" * 60)
    print("OpenAI Agents SDK + Gemini Integration Test")
    print("=" * 60)
    print()

    # Test 1: Add a task
    print("Test 1: Adding a task")
    print("-" * 60)
    result = await process_message(
        message="Add a task to buy groceries",
        user_id=test_user_id
    )
    print(f"Response: {result.get('response')}")
    print(f"Tool calls: {len(result.get('tool_calls', []))}")
    if result.get('error'):
        print(f"❌ Error: {result.get('message')}")
    else:
        print("✅ Success")
    print()

    # Test 2: List tasks
    print("Test 2: Listing tasks")
    print("-" * 60)
    result = await process_message(
        message="Show me my tasks",
        user_id=test_user_id
    )
    print(f"Response: {result.get('response')}")
    print(f"Tool calls: {len(result.get('tool_calls', []))}")
    if result.get('error'):
        print(f"❌ Error: {result.get('message')}")
    else:
        print("✅ Success")
    print()

    # Test 3: Ambiguous request
    print("Test 3: Handling ambiguous request")
    print("-" * 60)
    result = await process_message(
        message="Help me",
        user_id=test_user_id
    )
    print(f"Response: {result.get('response')}")
    print(f"Tool calls: {len(result.get('tool_calls', []))}")
    if result.get('error'):
        print(f"❌ Error: {result.get('message')}")
    else:
        print("✅ Success")
    print()

    # Test 4: Empty message validation
    print("Test 4: Empty message validation")
    print("-" * 60)
    result = await process_message(
        message="",
        user_id=test_user_id
    )
    print(f"Response: {result.get('response')}")
    if "didn't receive a message" in result.get('response', ''):
        print("✅ Validation working")
    else:
        print("❌ Validation failed")
    print()

    print("=" * 60)
    print("Test Complete")
    print("=" * 60)


if __name__ == "__main__":
    print("\nMake sure you have:")
    print("1. Set GEMINI_API_KEY in your .env file")
    print("2. Installed dependencies: pip install -r requirements.txt")
    print("3. Database is accessible (for MCP tools)")
    print()

    try:
        asyncio.run(test_agent())
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
