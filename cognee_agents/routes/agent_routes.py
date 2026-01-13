"""
Agent API Routes

FastAPI routes for invoking Pydantic AI agents.
Provides REST endpoints for the TypeScript backend to call.
"""

from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from cognee_agents.agents.banner_agent import (
    banner_design_agent,
    banner_feedback_agent,
    BannerAgentDeps,
    BannerDesignOutput,
    BannerFeedback,
)
from cognee_agents.agents.base import AgentResult
from cognee_agents.services.cognee_memory import memory
from cognee_agents.services.langfuse_tracer import tracer


router = APIRouter(prefix="/agents", tags=["agents"])


# Request/Response Models

class AgentRequest(BaseModel):
    """Base request for agent invocation."""
    prompt: str = Field(description="User prompt for the agent")
    user_id: str = Field(description="User identifier")
    session_id: Optional[str] = Field(default=None, description="Session identifier")
    metadata: dict[str, Any] = Field(default_factory=dict, description="Additional metadata")


class BannerDesignRequest(AgentRequest):
    """Request for banner design generation."""
    industry: Optional[str] = Field(default=None, description="Target industry")
    target_audience: Optional[str] = Field(default=None, description="Target audience")
    brand_colors: Optional[list[str]] = Field(default=None, description="Brand color palette")


class BannerFeedbackRequest(AgentRequest):
    """Request for banner feedback."""
    existing_design: dict[str, Any] = Field(description="Current design to analyze")


class AgentResponse(BaseModel):
    """Response from agent invocation."""
    success: bool
    output: Optional[Any] = None
    error: Optional[str] = None
    trace_id: Optional[str] = None
    tokens_used: int = 0
    latency_ms: int = 0
    memory_used: bool = False


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    services: dict[str, bool]


# Routes

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Check health of agent service and dependencies."""
    cognee_health = await memory.health_check()
    langfuse_health = tracer.is_enabled

    return HealthResponse(
        status="healthy" if cognee_health else "degraded",
        services={
            "cognee_memory": cognee_health,
            "langfuse_tracing": langfuse_health,
        }
    )


@router.post("/banner/design", response_model=AgentResponse)
async def generate_banner_design(request: BannerDesignRequest):
    """
    Generate a new banner design based on the user's prompt.

    The agent will:
    1. Load user preferences from memory
    2. Consider industry-specific trends
    3. Generate a complete design specification
    4. Store successful design patterns for future reference
    """
    try:
        deps = BannerAgentDeps(
            user_id=request.user_id,
            session_id=request.session_id,
            industry=request.industry,
            target_audience=request.target_audience,
            brand_colors=request.brand_colors,
        )

        result: AgentResult[BannerDesignOutput] = await banner_design_agent.run(
            request.prompt,
            user_id=request.user_id,
            session_id=request.session_id,
            deps=deps,
        )

        return AgentResponse(
            success=result.success,
            output=result.output.model_dump() if result.output else None,
            error=result.error,
            trace_id=result.trace_id,
            tokens_used=result.tokens_used,
            latency_ms=result.latency_ms,
            memory_used=result.memory_context_used,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/banner/feedback", response_model=AgentResponse)
async def get_banner_feedback(request: BannerFeedbackRequest):
    """
    Get feedback on an existing banner design.

    The agent will:
    1. Analyze the current design
    2. Score it against best practices
    3. Provide specific improvement suggestions
    4. Consider industry standards
    """
    try:
        deps = BannerAgentDeps(
            user_id=request.user_id,
            session_id=request.session_id,
            existing_design=request.existing_design,
        )

        result: AgentResult[BannerFeedback] = await banner_feedback_agent.run(
            request.prompt,
            user_id=request.user_id,
            session_id=request.session_id,
            deps=deps,
        )

        return AgentResponse(
            success=result.success,
            output=result.output.model_dump() if result.output else None,
            error=result.error,
            trace_id=result.trace_id,
            tokens_used=result.tokens_used,
            latency_ms=result.latency_ms,
            memory_used=result.memory_context_used,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/memory/search")
async def search_memory(
    query: str,
    agent_id: Optional[str] = None,
    user_id: Optional[str] = None,
    limit: int = 10,
):
    """
    Search the agent memory for relevant context.

    Useful for:
    - Finding past design patterns
    - Retrieving user preferences
    - Looking up successful templates
    """
    try:
        results = await memory.search(
            query=query,
            agent_id=agent_id,
            limit=limit,
        )

        return {
            "success": True,
            "results": [
                {
                    "id": r.id,
                    "content": r.content,
                    "score": r.score,
                    "metadata": r.metadata,
                }
                for r in results
            ],
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/memory/store")
async def store_learning(
    content: str,
    agent_id: str,
    category: str = "insight",
    user_id: Optional[str] = None,
    metadata: dict[str, Any] = {},
):
    """
    Store a learning in agent memory.

    Categories:
    - success: Successful interaction patterns
    - failure: Failed attempts for improvement
    - preference: User preferences
    - insight: General learnings
    """
    try:
        from cognee_agents.services.cognee_memory import Learning

        learning = Learning(
            content=content,
            agent_id=agent_id,
            category=category,
            metadata={
                "user_id": user_id,
                **metadata,
            },
        )

        doc_id = await memory.store_learning(learning)

        return {
            "success": True,
            "document_id": doc_id,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/memory/cognify/{agent_id}")
async def cognify_agent_memory(agent_id: str):
    """
    Process agent memory into knowledge graph.

    Should be called:
    - After significant learning additions
    - Periodically (e.g., daily)
    - Before complex queries
    """
    try:
        success = await memory.cognify(agent_id)

        return {
            "success": success,
            "message": f"Cognify {'completed' if success else 'failed'} for agent: {agent_id}",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
