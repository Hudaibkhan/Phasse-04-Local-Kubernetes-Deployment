# OpenAI Agents SDK + Gemini Integration - Migration Guide

## Overview

The chatbot backend has been migrated from OpenAI Assistants API to the **OpenAI Agents SDK** with **Gemini API** support through OpenAI-compatible endpoints.

## What Changed

### ✅ New Files Created

1. **`src/ai/connection.py`**
   - Configures Gemini API connection using AsyncOpenAI client
   - Sets up OpenAIChatCompletionsModel with Gemini 2.0 Flash
   - Creates RunConfig for agent execution
   - Uses OpenAI-compatible endpoint: `https://generativelanguage.googleapis.com/v1beta/openai/`

2. **`src/ai/agent.py`** (Completely Rewritten)
   - Uses OpenAI Agents SDK `Agent` and `Runner`
   - Implements MCP tools with `@function_tool` decorator
   - Tools are context-aware (receive user_id automatically)
   - Async implementation with `Runner.run()`
   - No more thread management or polling loops

### 🗑️ Deprecated Files (Can be removed)

- **`src/ai/config.py`** - Replaced by connection.py
- **`src/ai/tool_registry.py`** - Tools now defined in agent.py with @function_tool

### 🔄 Modified Files

1. **`src/api/chat.py`**
   - Changed `result = process_message(...)` to `result = await process_message(...)`
   - Now properly awaits the async agent execution

2. **`requirements.txt`**
   - Added: `openai-agents>=0.2.0`
   - Added: `python-dotenv`
   - Kept: `openai>=1.59.4` (required by openai-agents)

3. **`.env.example`**
   - Added: `GEMINI_API_KEY=your_gemini_api_key_here`
   - Removed: `OPENAI_API_KEY` (no longer needed)

## Architecture Changes

### Before (OpenAI Assistants API)
```
User Message → FastAPI Endpoint → OpenAI Assistants API
                                   ↓
                            Create Thread
                                   ↓
                            Create Run
                                   ↓
                            Poll for Status
                                   ↓
                            Handle Tool Calls (manual loop)
                                   ↓
                            Submit Tool Outputs
                                   ↓
                            Poll Again...
                                   ↓
                            Get Final Response
                                   ↓
                            Delete Thread
```

### After (OpenAI Agents SDK + Gemini)
```
User Message → FastAPI Endpoint → Runner.run()
                                   ↓
                            Agent with Tools
                                   ↓
                            Gemini API (via OpenAI-compatible endpoint)
                                   ↓
                            Automatic Tool Execution
                                   ↓
                            Final Response
```

## Key Benefits

### 1. **No OpenAI API Key Required**
- Uses Gemini API instead (free tier available)
- OpenAI-compatible endpoint means no code changes needed

### 2. **Simpler Code**
- No manual thread management
- No polling loops
- No retry logic needed (handled by SDK)
- Automatic tool execution

### 3. **Better Performance**
- Single async call instead of multiple polling requests
- No thread creation/deletion overhead
- Faster response times

### 4. **Official SDK Support**
- Uses OpenAI's official Agents SDK
- Better maintained and documented
- Future-proof architecture

### 5. **MCP Tools Integration**
- Tools defined with `@function_tool` decorator
- Automatic context injection (user_id)
- Type-safe with Pydantic models
- Error handling built-in

## Installation

### 1. Install Dependencies
```bash
cd Quantum-Todo-Backend
pip install -r requirements.txt
```

### 2. Set Up Environment Variables
```bash
# Copy example file
cp .env.example .env

# Edit .env and add your Gemini API key
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Get Gemini API Key
1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key
3. Copy and paste into `.env` file

### 4. Remove Old Configuration (Optional)
```bash
# These files are no longer used
rm src/ai/config.py
rm src/ai/tool_registry.py
```

## Testing

### 1. Start Backend Server
```bash
uvicorn main:app --reload
```

### 2. Test Chat Endpoint
```bash
# Login first to get JWT token
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use the token to test chat
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "Add a task to buy groceries"}'
```

### 3. Expected Response
```json
{
  "response": "I've added a task for you: 'Buy groceries'. Is there anything else you'd like me to help with?",
  "tool_calls": [
    {
      "tool": "add_task_tool",
      "arguments": {"title": "Buy groceries", "description": null},
      "result": {"success": true, "task_id": "..."}
    }
  ]
}
```

## Tool Definitions

All MCP tools are now defined in `src/ai/agent.py`:

### 1. **add_task_tool**
- Creates a new task
- Args: `title` (required), `description` (optional)

### 2. **list_tasks_tool**
- Lists user's tasks
- Args: `status` (pending/completed/all), `search` (optional)

### 3. **complete_task_tool**
- Marks task as completed
- Args: `task_id` (required)

### 4. **update_task_tool**
- Updates task title or description
- Args: `task_id` (required), `title` (optional), `description` (optional)

### 5. **delete_task_tool**
- Permanently deletes a task
- Args: `task_id` (required)

## Agent Instructions

The agent is configured with detailed instructions in `src/ai/agent.py`:

- **Task Reference Handling**: Finds tasks by name using list_tasks_tool
- **Ambiguous Requests**: Asks clarifying questions
- **Error Handling**: Provides user-friendly error messages
- **Tone**: Friendly, conversational, and helpful

## Troubleshooting

### Error: "GEMINI_API_KEY environment variable not set"
**Solution**: Add `GEMINI_API_KEY` to your `.env` file

### Error: "Module 'agents' not found"
**Solution**: Run `pip install openai-agents>=0.2.0`

### Error: "AsyncOpenAI object has no attribute..."
**Solution**: Ensure `openai>=1.59.4` is installed

### Agent not responding or timing out
**Solution**:
1. Check Gemini API key is valid
2. Verify internet connection
3. Check Gemini API quota/limits

### Tools not executing
**Solution**:
1. Verify MCP server tools are working (test manually)
2. Check database connection
3. Review logs for tool execution errors

## Migration Checklist

- [ ] Install new dependencies (`pip install -r requirements.txt`)
- [ ] Add `GEMINI_API_KEY` to `.env` file
- [ ] Remove `OPENAI_API_KEY` from `.env` (no longer needed)
- [ ] Test chat endpoint with sample messages
- [ ] Verify tasks are created/updated/deleted correctly
- [ ] Check frontend chatbot UI still works
- [ ] Remove old config.py and tool_registry.py (optional)
- [ ] Update any documentation referencing OpenAI API

## Rollback Plan

If you need to rollback to the old implementation:

1. Restore old `src/ai/agent.py` from git history
2. Restore old `src/ai/config.py` and `src/ai/tool_registry.py`
3. Change `await process_message(...)` back to `process_message(...)`
4. Remove `openai-agents` from requirements.txt
5. Add `OPENAI_API_KEY` back to `.env`

## Support

For issues or questions:
1. Check OpenAI Agents SDK docs: https://openai.github.io/openai-agents-python/
2. Check Gemini API docs: https://ai.google.dev/gemini-api/docs
3. Review logs in `Quantum-Todo-Backend/logs/`
4. Test MCP tools independently to isolate issues

## Next Steps

1. **Monitor Performance**: Track response times and error rates
2. **Optimize Prompts**: Refine agent instructions based on user feedback
3. **Add More Tools**: Extend functionality with additional MCP tools
4. **Implement Caching**: Cache common queries for faster responses
5. **Add Analytics**: Track tool usage and conversation patterns

---

**Migration Date**: 2026-02-09
**OpenAI Agents SDK Version**: 0.2.0+
**Gemini Model**: gemini-2.0-flash-exp
