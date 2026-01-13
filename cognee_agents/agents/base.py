"""
Base Agent Infrastructure

Provides the foundation for all Pydantic AI agents in the Nanobanna system.
Includes memory integration, Langfuse tracing, and structured output support.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Generic, Optional, TypeVar

from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext

from cognee_agents.config import settings
from cognee_agents.services.cognee_memory import memory, MemoryContext, Learning
from cognee_agents.services.langfuse_tracer import tracer


# Type variables for agent generics
DepsT = TypeVar("DepsT")
OutputT = TypeVar("OutputT", bound=BaseModel)


@dataclass
class AgentDependencies:
    """
    Base dependencies injected into all agents.

    Provides access to:
    - User context
    - Session context
    - Pre-loaded memory
    - HTTP client for tools
    """
    user_id: str
    session_id: Optional[str] = None
    memory_context: MemoryContext = field(default_factory=MemoryContext)
    metadata: dict[str, Any] = field(default_factory=dict)


class AgentResult(BaseModel, Generic[OutputT]):
    """
    Standardized result wrapper for all agent outputs.

    Includes metadata for tracking and learning.
    """
    success: bool = Field(description="Whether the agent completed successfully")
    output: Optional[OutputT] = Field(default=None, description="The agent's output")
    error: Optional[str] = Field(default=None, description="Error message if failed")
    trace_id: Optional[str] = Field(default=None, description="Langfuse trace ID")
    tokens_used: int = Field(default=0, description="Total tokens consumed")
    latency_ms: int = Field(default=0, description="Execution time in milliseconds")
    memory_context_used: bool = Field(default=False, description="Whether memory was used")


class NanobannaAgent(ABC, Generic[DepsT, OutputT]):
    """
    Abstract base class for Nanobanna AI agents.

    Provides:
    - Automatic memory pre-loading
    - Langfuse tracing integration
    - Learning storage after completion
    - Structured output validation

    Subclasses must implement:
    - _create_agent(): Return configured Pydantic AI Agent
    - _get_instructions(): Return system prompt
    - agent_id: Unique identifier for memory namespace

    Usage:
        class BannerAgent(NanobannaAgent[BannerDeps, BannerOutput]):
            agent_id = "banner_agent"

            def _create_agent(self):
                return Agent('openai:gpt-4o', ...)
    """

    @property
    @abstractmethod
    def agent_id(self) -> str:
        """Unique identifier for this agent type."""
        pass

    @abstractmethod
    def _create_agent(self) -> Agent[DepsT, OutputT]:
        """Create and return the Pydantic AI agent instance."""
        pass

    @abstractmethod
    def _get_instructions(self, memory_context: MemoryContext) -> str:
        """Get the system prompt, optionally enhanced with memory context."""
        pass

    def __init__(self):
        self._agent: Optional[Agent[DepsT, OutputT]] = None

    @property
    def agent(self) -> Agent[DepsT, OutputT]:
        """Lazily initialize the Pydantic AI agent."""
        if self._agent is None:
            self._agent = self._create_agent()
        return self._agent

    async def run(
        self,
        prompt: str,
        *,
        user_id: str,
        session_id: Optional[str] = None,
        deps: Optional[DepsT] = None,
        **kwargs,
    ) -> AgentResult[OutputT]:
        """
        Execute the agent with full memory and tracing integration.

        Flow:
        1. Pre-load memory context from Cognee
        2. Create trace in Langfuse
        3. Run Pydantic AI agent
        4. Store learnings on success
        5. Return structured result

        Args:
            prompt: User's input prompt
            user_id: User identifier for memory and tracking
            session_id: Optional session for conversation context
            deps: Optional custom dependencies
            **kwargs: Additional args passed to agent.run()

        Returns:
            AgentResult with output and metadata
        """
        start_time = datetime.utcnow()
        trace_id = tracer.create_trace_id(seed=f"{self.agent_id}:{user_id}:{session_id}")

        try:
            # Step 1: Pre-load memory context
            memory_context = await memory.pre_load_context(
                agent_id=self.agent_id,
                session_id=session_id,
                query=prompt,
            )

            # Step 2: Trace the agent run
            async with tracer.trace_agent_run(
                self.agent_id,
                session_id=session_id,
                user_id=user_id,
                input_data={"prompt": prompt[:500]},
                metadata={"memory_tokens": memory_context.total_tokens},
            ) as trace:
                # Step 3: Prepare dependencies with memory context
                agent_deps = self._prepare_dependencies(
                    deps,
                    user_id=user_id,
                    session_id=session_id,
                    memory_context=memory_context,
                )

                # Step 4: Run the agent
                result = await self.agent.run(
                    prompt,
                    deps=agent_deps,
                    **kwargs,
                )

                # Calculate metrics
                end_time = datetime.utcnow()
                latency_ms = int((end_time - start_time).total_seconds() * 1000)
                tokens_used = result.usage().input_tokens + result.usage().output_tokens if hasattr(result, 'usage') else 0

                # Update trace with output
                trace.update(
                    output={"success": True, "output_type": type(result.output).__name__},
                    metadata={"tokens": tokens_used, "latency_ms": latency_ms},
                )

                # Step 5: Store learning on success
                if memory.is_enabled:
                    await self._store_success_learning(
                        prompt=prompt,
                        output=result.output,
                        user_id=user_id,
                    )

                return AgentResult(
                    success=True,
                    output=result.output,
                    trace_id=trace_id,
                    tokens_used=tokens_used,
                    latency_ms=latency_ms,
                    memory_context_used=memory_context.total_tokens > 0,
                )

        except Exception as e:
            end_time = datetime.utcnow()
            latency_ms = int((end_time - start_time).total_seconds() * 1000)

            # Store failure learning
            if memory.is_enabled:
                await self._store_failure_learning(
                    prompt=prompt,
                    error=str(e),
                    user_id=user_id,
                )

            return AgentResult(
                success=False,
                error=str(e),
                trace_id=trace_id,
                latency_ms=latency_ms,
            )

    def _prepare_dependencies(
        self,
        custom_deps: Optional[DepsT],
        user_id: str,
        session_id: Optional[str],
        memory_context: MemoryContext,
    ) -> DepsT:
        """
        Prepare dependencies for agent execution.

        Override this method to customize dependency injection.
        """
        # If custom deps provided, return as-is
        if custom_deps is not None:
            return custom_deps

        # Default: return AgentDependencies (subclasses should override)
        return AgentDependencies(
            user_id=user_id,
            session_id=session_id,
            memory_context=memory_context,
        )  # type: ignore

    async def _store_success_learning(
        self,
        prompt: str,
        output: OutputT,
        user_id: str,
    ) -> None:
        """Store a successful interaction as a learning."""
        learning = Learning(
            content=f"Successful response to: {prompt[:200]}\nOutput type: {type(output).__name__}",
            agent_id=self.agent_id,
            category="success",
            metadata={"user_id": user_id},
        )
        await memory.store_learning(learning)

    async def _store_failure_learning(
        self,
        prompt: str,
        error: str,
        user_id: str,
    ) -> None:
        """Store a failed interaction for future improvement."""
        learning = Learning(
            content=f"Failed request: {prompt[:200]}\nError: {error}",
            agent_id=self.agent_id,
            category="failure",
            metadata={"user_id": user_id, "error_type": error.split(":")[0]},
        )
        await memory.store_learning(learning)


# Common output models for agents

class TextOutput(BaseModel):
    """Simple text output."""
    text: str = Field(description="Generated text content")
    confidence: float = Field(default=1.0, ge=0, le=1, description="Confidence score")


class AnalysisOutput(BaseModel):
    """Analysis result output."""
    summary: str = Field(description="Analysis summary")
    insights: list[str] = Field(default_factory=list, description="Key insights")
    recommendations: list[str] = Field(default_factory=list, description="Recommendations")
    confidence: float = Field(default=1.0, ge=0, le=1, description="Confidence score")


class ActionOutput(BaseModel):
    """Action execution output."""
    action: str = Field(description="Action taken")
    result: str = Field(description="Action result")
    success: bool = Field(default=True, description="Whether action succeeded")
    next_steps: list[str] = Field(default_factory=list, description="Suggested next steps")
