"""
Langfuse Tracer Service

Provides observability and tracing for all agent operations using Langfuse.
Integrates with Pydantic AI agents for automatic trace capture.
"""

from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Optional
from functools import wraps

from langfuse import Langfuse, get_client
from langfuse.decorators import observe

from cognee_agents.config import settings


@dataclass
class TraceContext:
    """Context for a single trace operation."""
    trace_id: str
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    agent_id: Optional[str] = None
    metadata: dict[str, Any] = field(default_factory=dict)
    start_time: datetime = field(default_factory=datetime.utcnow)


class LangfuseTracer:
    """
    Langfuse tracing service for Pydantic AI agents.

    Provides:
    - Automatic trace creation for agent runs
    - Session grouping for multi-turn conversations
    - User attribution for analytics
    - Cost and token tracking
    - Memory operation tracing
    """

    _instance: Optional[LangfuseTracer] = None
    _client: Optional[Langfuse] = None

    def __new__(cls) -> LangfuseTracer:
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if self._client is None and settings.tracing_enabled:
            self._initialize_client()

    def _initialize_client(self) -> None:
        """Initialize Langfuse client with configuration."""
        if not settings.langfuse_public_key or not settings.langfuse_secret_key:
            print("[Langfuse] Credentials not configured, tracing disabled")
            return

        try:
            self._client = Langfuse(
                public_key=settings.langfuse_public_key,
                secret_key=settings.langfuse_secret_key,
                host=settings.langfuse_host,
            )
            print(f"[Langfuse] Initialized with host: {settings.langfuse_host}")
        except Exception as e:
            print(f"[Langfuse] Initialization failed: {e}")
            self._client = None

    @property
    def client(self) -> Optional[Langfuse]:
        """Get the Langfuse client instance."""
        return self._client

    @property
    def is_enabled(self) -> bool:
        """Check if tracing is enabled and configured."""
        return self._client is not None and settings.tracing_enabled

    def create_trace_id(self, seed: Optional[str] = None) -> str:
        """Generate a deterministic or random trace ID."""
        if self._client and seed:
            return Langfuse.create_trace_id(seed=seed)
        import uuid
        return str(uuid.uuid4()).replace("-", "")

    @asynccontextmanager
    async def trace_agent_run(
        self,
        agent_name: str,
        *,
        session_id: Optional[str] = None,
        user_id: Optional[str] = None,
        input_data: Optional[dict[str, Any]] = None,
        metadata: Optional[dict[str, Any]] = None,
    ):
        """
        Context manager for tracing an agent run.

        Usage:
            async with tracer.trace_agent_run("banner_agent", user_id="user123") as trace:
                result = await agent.run(...)
                trace.update(output=result)
        """
        if not self.is_enabled:
            # Yield a no-op context when tracing is disabled
            yield type("NoOpTrace", (), {"update": lambda **kw: None, "trace_id": "disabled"})()
            return

        trace_id = self.create_trace_id(seed=f"{agent_name}:{session_id}:{datetime.utcnow().isoformat()}")

        with self._client.start_as_current_observation(
            as_type="span",
            name=f"agent:{agent_name}",
            trace_context={"trace_id": trace_id},
        ) as span:
            # Set trace-level attributes
            span.update(
                input=input_data,
                metadata={
                    "agent_name": agent_name,
                    "service": settings.service_name,
                    "environment": settings.environment,
                    **(metadata or {}),
                },
            )

            # Propagate session and user IDs
            from langfuse import propagate_attributes
            with propagate_attributes(
                session_id=session_id,
                user_id=user_id,
            ):
                try:
                    yield span
                except Exception as e:
                    span.update(
                        output={"error": str(e)},
                        metadata={"error_type": type(e).__name__},
                    )
                    raise

    @asynccontextmanager
    async def trace_llm_call(
        self,
        model: str,
        *,
        input_messages: Optional[list[dict]] = None,
        metadata: Optional[dict[str, Any]] = None,
    ):
        """
        Context manager for tracing an LLM call within an agent.

        Usage:
            async with tracer.trace_llm_call("gpt-4o", input_messages=[...]) as gen:
                response = await llm.generate(...)
                gen.update(output=response, usage={"input": 100, "output": 50})
        """
        if not self.is_enabled:
            yield type("NoOpGen", (), {"update": lambda **kw: None})()
            return

        with self._client.start_as_current_observation(
            as_type="generation",
            name=f"llm:{model}",
            model=model,
            input=input_messages,
            metadata=metadata,
        ) as generation:
            try:
                yield generation
            except Exception as e:
                generation.update(output={"error": str(e)})
                raise

    @asynccontextmanager
    async def trace_memory_operation(
        self,
        operation: str,
        agent_id: str,
        *,
        query: Optional[str] = None,
        metadata: Optional[dict[str, Any]] = None,
    ):
        """
        Context manager for tracing Cognee memory operations.

        Operations: search, add, cognify, query
        """
        if not self.is_enabled:
            yield type("NoOpMemory", (), {"update": lambda **kw: None})()
            return

        with self._client.start_as_current_observation(
            as_type="span",
            name=f"memory:{operation}",
            input={"query": query, "agent_id": agent_id},
            metadata={
                "operation": operation,
                "agent_id": agent_id,
                **(metadata or {}),
            },
        ) as span:
            try:
                yield span
            except Exception as e:
                span.update(output={"error": str(e)})
                raise

    def score_trace(
        self,
        name: str,
        value: float | str | bool,
        *,
        trace_id: Optional[str] = None,
        data_type: str = "NUMERIC",
        comment: Optional[str] = None,
    ) -> None:
        """
        Add a score to the current trace for evaluation.

        Args:
            name: Score name (e.g., "user_satisfaction", "quality")
            value: Score value
            data_type: NUMERIC, CATEGORICAL, or BOOLEAN
            comment: Optional comment explaining the score
        """
        if not self.is_enabled:
            return

        try:
            self._client.score_current_trace(
                name=name,
                value=value,
                data_type=data_type,
                comment=comment,
            )
        except Exception as e:
            print(f"[Langfuse] Score failed: {e}")

    def flush(self) -> None:
        """Flush any pending traces to Langfuse."""
        if self._client:
            self._client.flush()


# Singleton instance
tracer = LangfuseTracer()


def traced_agent(name: Optional[str] = None):
    """
    Decorator for tracing Pydantic AI agent functions.

    Usage:
        @traced_agent("banner_agent")
        async def generate_banner(prompt: str, user_id: str):
            ...
    """
    def decorator(func):
        agent_name = name or func.__name__

        @wraps(func)
        async def wrapper(*args, **kwargs):
            session_id = kwargs.get("session_id")
            user_id = kwargs.get("user_id")

            async with tracer.trace_agent_run(
                agent_name,
                session_id=session_id,
                user_id=user_id,
                input_data={"args": str(args), "kwargs": {k: str(v)[:100] for k, v in kwargs.items()}},
            ) as trace:
                result = await func(*args, **kwargs)
                trace.update(output={"result_type": type(result).__name__})
                return result

        return wrapper
    return decorator
