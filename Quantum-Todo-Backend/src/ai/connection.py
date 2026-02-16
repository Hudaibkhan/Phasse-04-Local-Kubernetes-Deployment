"""
Gemini LLM connection using OpenAI-compatible endpoint with Groq fallback.

This module configures the external LLM provider (Gemini) to work with
the OpenAI Agents SDK through OpenAI-compatible API endpoints.
When Gemini API limit is exceeded, it falls back to Groq.
"""
import os
from agents import AsyncOpenAI, OpenAIChatCompletionsModel, RunConfig
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Get API keys from environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GEMINI_API_KEY and not GROQ_API_KEY:
    raise ValueError(
        "Either GEMINI_API_KEY or GROQ_API_KEY environment variable must be set. "
        "Please add at least one to your .env file."
    )

# Initialize Gemini client (primary)
gemini_client = None
gemini_model = None
gemini_config = None

if GEMINI_API_KEY:
    gemini_client = AsyncOpenAI(
        api_key=GEMINI_API_KEY,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    )

    gemini_model = OpenAIChatCompletionsModel(
        model="gemini-2.5-flash",
        openai_client=gemini_client
    )

    gemini_config = RunConfig(
        model=gemini_model,
        model_provider=gemini_client,
        tracing_disabled=True
    )
    logger.info("Gemini connection initialized successfully")

# Initialize Groq client (fallback)
groq_client = None
groq_model = None
groq_config = None

if GROQ_API_KEY:
    groq_client = AsyncOpenAI(
        api_key=GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1"
    )

    groq_model = OpenAIChatCompletionsModel(
        model="mixtral-8x7b-32768",  # Mixtral has excellent function calling support
        openai_client=groq_client
    )

    groq_config = RunConfig(
        model=groq_model,
        model_provider=groq_client,
        tracing_disabled=True
    )
    logger.info("Groq connection initialized successfully")

# Set primary and fallback configurations
config = gemini_config if gemini_config else groq_config
fallback_config = groq_config if gemini_config and groq_config else None

if fallback_config:
    logger.info("Fallback LLM (Groq) configured successfully")

