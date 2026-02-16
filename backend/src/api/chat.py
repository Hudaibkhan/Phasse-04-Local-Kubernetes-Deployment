"""
Chat API endpoint for AI agent interaction.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from slowapi import Limiter
from slowapi.util import get_remote_address
from src.middleware.auth import get_current_user
from src.ai.agent import process_message
import logging
import time

router = APIRouter()
logger = logging.getLogger(__name__)

# Rate limiter configuration
limiter = Limiter(key_func=get_remote_address)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    response: str
    tool_calls: list = []


@router.post("/chat", response_model=ChatResponse)
@limiter.limit("10/minute")
async def chat(
    request: Request,
    chat_request: ChatRequest,
    current_user=Depends(get_current_user)
):
    """
    Send a message to the AI agent and receive a response.

    The agent processes natural language commands and invokes
    appropriate MCP tools to manage tasks.

    Rate limit: 10 requests per minute per IP address.
    """
    start_time = time.time()

    # Log incoming request
    logger.info(
        f"Chat request from user {current_user.id} | "
        f"Message length: {len(chat_request.message)} chars | "
        f"IP: {get_remote_address(request)}"
    )

    try:
        result = await process_message(
            message=chat_request.message,
            user_id=current_user.id
        )

        # Calculate processing time
        processing_time = time.time() - start_time

        if isinstance(result, dict) and result.get("error"):
            logger.error(
                f"Chat error for user {current_user.id} | "
                f"Processing time: {processing_time:.2f}s | "
                f"Error: {result.get('message')}"
            )
            raise HTTPException(
                status_code=500,
                detail=result.get("message", "Failed to process message")
            )

        # Log successful response
        response_length = len(result.get("response", ""))
        tool_calls_count = len(result.get("tool_calls", []))

        logger.info(
            f"Chat success for user {current_user.id} | "
            f"Processing time: {processing_time:.2f}s | "
            f"Response length: {response_length} chars | "
            f"Tool calls: {tool_calls_count} | "
            f"Tools used: {[tc['tool'] for tc in result.get('tool_calls', [])]}"
        )

        return ChatResponse(
            response=result["response"],
            tool_calls=result.get("tool_calls", [])
        )

    except HTTPException:
        raise
    except Exception as e:
        processing_time = time.time() - start_time
        logger.error(
            f"Chat endpoint error for user {current_user.id} | "
            f"Processing time: {processing_time:.2f}s | "
            f"Error: {str(e)}",
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="Failed to process message. Please try again."
        )
