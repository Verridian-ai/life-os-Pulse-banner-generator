"""
Agent Service Configuration

Pydantic Settings for environment-based configuration with type safety.
"""

from pydantic import Field
from pydantic_settings import BaseSettings


class AgentSettings(BaseSettings):
    """Configuration for the Pydantic AI Agent Service."""

    # Service Settings
    service_name: str = Field(default="nanobanna-agent-service", description="Service identifier")
    environment: str = Field(default="development", description="Environment: development, staging, production")
    debug: bool = Field(default=False, description="Enable debug mode")
    port: int = Field(default=8001, description="Agent service port")

    # LLM Configuration
    openrouter_api_key: str = Field(default="", description="OpenRouter API key for LLM access")
    openai_api_key: str = Field(default="", description="OpenAI API key (fallback)")
    anthropic_api_key: str = Field(default="", description="Anthropic API key (fallback)")
    default_model: str = Field(default="google/gemini-2.0-flash-exp:free", description="Default LLM model")

    # Cognee Memory Settings
    cognee_api_url: str = Field(default="http://localhost:8000", description="Cognee service URL")
    cognee_api_key: str = Field(default="", description="Cognee API key")
    memory_enabled: bool = Field(default=True, description="Enable Cognee memory integration")

    # Langfuse Observability
    langfuse_public_key: str = Field(default="", description="Langfuse public key")
    langfuse_secret_key: str = Field(default="", description="Langfuse secret key")
    langfuse_host: str = Field(default="https://cloud.langfuse.com", description="Langfuse host URL")
    tracing_enabled: bool = Field(default=True, description="Enable Langfuse tracing")

    # Agent Limits
    max_concurrent_agents: int = Field(default=5, description="Max concurrent agent executions")
    agent_timeout_seconds: int = Field(default=120, description="Agent execution timeout")
    max_memory_context_tokens: int = Field(default=4000, description="Max tokens for memory context")

    class Config:
        env_prefix = "AGENT_"
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = AgentSettings()
