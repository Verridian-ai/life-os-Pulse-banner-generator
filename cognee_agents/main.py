"""
Pydantic AI Agent Service

FastAPI application for the Nanobanna AI agent infrastructure.
Provides REST API for agent invocation with Langfuse tracing and Cognee memory.
"""

from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from cognee_agents.config import settings
from cognee_agents.routes.agent_routes import router as agent_router
from cognee_agents.services.cognee_memory import memory
from cognee_agents.services.langfuse_tracer import tracer


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.

    Startup:
    - Initialize Langfuse tracer
    - Verify Cognee connection
    - Log configuration

    Shutdown:
    - Flush Langfuse traces
    - Close HTTP clients
    """
    # Startup
    print(f"[AgentService] Starting {settings.service_name}")
    print(f"[AgentService] Environment: {settings.environment}")
    print(f"[AgentService] Langfuse tracing: {'enabled' if tracer.is_enabled else 'disabled'}")
    print(f"[AgentService] Cognee memory: {'enabled' if memory.is_enabled else 'disabled'}")

    # Check Cognee health
    if memory.is_enabled:
        healthy = await memory.health_check()
        print(f"[AgentService] Cognee health: {'OK' if healthy else 'DEGRADED'}")

    yield

    # Shutdown
    print("[AgentService] Shutting down...")
    tracer.flush()
    await memory.close()
    print("[AgentService] Shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="Nanobanna Agent Service",
    description="Pydantic AI agents with Langfuse tracing and Cognee memory",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5178",
        "http://localhost:8888",
        "https://life-os-banner.verridian.ai",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(agent_router)


@app.get("/")
async def root():
    """Root endpoint with service info."""
    return {
        "service": settings.service_name,
        "version": "1.0.0",
        "environment": settings.environment,
        "features": {
            "langfuse_tracing": tracer.is_enabled,
            "cognee_memory": memory.is_enabled,
        },
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    cognee_healthy = await memory.health_check() if memory.is_enabled else False

    return {
        "status": "healthy",
        "services": {
            "cognee": cognee_healthy,
            "langfuse": tracer.is_enabled,
        },
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=settings.debug,
    )
