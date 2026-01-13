"""
Cognee Memory Service

Provides three-tier memory architecture for AI agents:
- Global Memory: Shared knowledge across all agents
- Agent Memory: Agent-specific learnings and context
- Session Memory: Short-term conversation context

Integrates with Pydantic AI for automatic context injection.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Optional
import asyncio

import httpx

from cognee_agents.config import settings
from cognee_agents.services.langfuse_tracer import tracer


@dataclass
class MemoryContext:
    """Pre-loaded context for agent execution."""
    global_context: list[str] = field(default_factory=list)
    agent_context: list[str] = field(default_factory=list)
    session_context: list[str] = field(default_factory=list)
    total_tokens: int = 0
    timestamp: datetime = field(default_factory=datetime.utcnow)

    def to_prompt(self, max_tokens: int = 4000) -> str:
        """Convert memory context to a system prompt section."""
        sections = []

        if self.global_context:
            sections.append("## Global Knowledge\n" + "\n".join(self.global_context[:3]))

        if self.agent_context:
            sections.append("## Agent Memory\n" + "\n".join(self.agent_context[:5]))

        if self.session_context:
            sections.append("## Session Context\n" + "\n".join(self.session_context[:5]))

        combined = "\n\n".join(sections)

        # Truncate if exceeds token budget (rough estimate: 4 chars per token)
        char_limit = max_tokens * 4
        if len(combined) > char_limit:
            combined = combined[:char_limit] + "\n...[truncated]"

        return combined


@dataclass
class SearchResult:
    """Search result from Cognee."""
    id: str
    content: str
    score: float
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class Learning:
    """A learning to be stored in agent memory."""
    content: str
    agent_id: str
    category: str  # "success", "failure", "preference", "insight"
    metadata: dict[str, Any] = field(default_factory=dict)


class CogneeMemoryService:
    """
    Three-tier memory service using Cognee for knowledge graph storage.

    Memory Tiers:
    1. Global: Shared across all agents (dataset: 'global')
    2. Agent: Per-agent memory (dataset: 'agent_{agent_id}')
    3. Session: Per-session context (dataset: 'session_{session_id}')

    Integration with Pydantic AI:
    - Pre-load context before agent.run()
    - Store learnings after agent completion
    - Automatic memory search during tool execution
    """

    def __init__(self):
        self.base_url = settings.cognee_api_url
        self.api_key = settings.cognee_api_key
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def is_enabled(self) -> bool:
        """Check if memory service is configured."""
        return bool(self.api_key and self.base_url and settings.memory_enabled)

    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create HTTP client."""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                timeout=30.0,
            )
        return self._client

    async def close(self) -> None:
        """Close the HTTP client."""
        if self._client:
            await self._client.aclose()
            self._client = None

    async def pre_load_context(
        self,
        agent_id: str,
        session_id: Optional[str] = None,
        query: Optional[str] = None,
    ) -> MemoryContext:
        """
        Pre-load memory context before agent execution.

        This should be called before every agent.run() to inject relevant context.

        Args:
            agent_id: The agent identifier
            session_id: Optional session for conversation context
            query: Optional query to focus the memory search

        Returns:
            MemoryContext with pre-loaded knowledge
        """
        if not self.is_enabled:
            return MemoryContext()

        async with tracer.trace_memory_operation("pre_load", agent_id, query=query):
            context = MemoryContext()

            try:
                # Parallel search across all tiers
                tasks = [
                    self._search_tier("global", query or "important knowledge", limit=3),
                    self._search_tier(f"agent_{agent_id}", query or "agent context", limit=5),
                ]

                if session_id:
                    tasks.append(
                        self._search_tier(f"session_{session_id}", query or "recent context", limit=5)
                    )

                results = await asyncio.gather(*tasks, return_exceptions=True)

                # Process results
                for i, result in enumerate(results):
                    if isinstance(result, Exception):
                        print(f"[CogneeMemory] Search tier {i} failed: {result}")
                        continue

                    tier_results = result or []
                    contents = [r.content for r in tier_results]

                    if i == 0:  # Global
                        context.global_context = contents
                    elif i == 1:  # Agent
                        context.agent_context = contents
                    elif i == 2:  # Session
                        context.session_context = contents

                # Estimate total tokens (rough: 1 token per 4 chars)
                total_chars = sum(len(c) for c in context.global_context + context.agent_context + context.session_context)
                context.total_tokens = total_chars // 4

            except Exception as e:
                print(f"[CogneeMemory] Pre-load failed: {e}")

            return context

    async def store_learning(self, learning: Learning) -> str:
        """
        Store a learning in agent memory after task completion.

        This should be called after agent.run() to persist insights.

        Args:
            learning: The learning to store

        Returns:
            Document ID of the stored learning
        """
        if not self.is_enabled:
            return "memory_disabled"

        async with tracer.trace_memory_operation(
            "store_learning",
            learning.agent_id,
            metadata={"category": learning.category},
        ):
            try:
                client = await self._get_client()

                # Format learning for storage
                formatted_content = f"""
Learning Category: {learning.category}
Agent: {learning.agent_id}
Timestamp: {datetime.utcnow().isoformat()}

{learning.content}

Metadata: {learning.metadata}
"""

                # Create multipart form data
                files = {
                    "data": ("learning.txt", formatted_content.encode(), "text/plain"),
                }
                data = {
                    "datasetName": f"agent_{learning.agent_id}",
                }

                response = await client.post("/api/v1/add", files=files, data=data)
                response.raise_for_status()

                result = response.json()
                doc_id = result.get("id") or result.get("document_id") or "unknown"

                print(f"[CogneeMemory] Learning stored: {doc_id}")
                return doc_id

            except Exception as e:
                print(f"[CogneeMemory] Store learning failed: {e}")
                return "error"

    async def store_session_message(
        self,
        session_id: str,
        role: str,
        content: str,
        metadata: Optional[dict[str, Any]] = None,
    ) -> str:
        """
        Store a message in session memory for conversation context.

        Args:
            session_id: Session identifier
            role: Message role (user, assistant, system)
            content: Message content
            metadata: Optional metadata

        Returns:
            Document ID
        """
        if not self.is_enabled:
            return "memory_disabled"

        async with tracer.trace_memory_operation("store_session", session_id):
            try:
                client = await self._get_client()

                formatted_content = f"""
Role: {role}
Timestamp: {datetime.utcnow().isoformat()}
Content: {content}
"""

                files = {
                    "data": ("message.txt", formatted_content.encode(), "text/plain"),
                }
                data = {
                    "datasetName": f"session_{session_id}",
                }

                response = await client.post("/api/v1/add", files=files, data=data)
                response.raise_for_status()

                result = response.json()
                return result.get("id") or "unknown"

            except Exception as e:
                print(f"[CogneeMemory] Store session message failed: {e}")
                return "error"

    async def search(
        self,
        query: str,
        agent_id: Optional[str] = None,
        limit: int = 10,
    ) -> list[SearchResult]:
        """
        Search memory for relevant context.

        Args:
            query: Search query
            agent_id: Optional agent namespace
            limit: Max results

        Returns:
            List of search results
        """
        if not self.is_enabled:
            return []

        dataset = f"agent_{agent_id}" if agent_id else None
        return await self._search_tier(dataset, query, limit)

    async def _search_tier(
        self,
        dataset: Optional[str],
        query: str,
        limit: int = 10,
    ) -> list[SearchResult]:
        """Internal search method for a specific dataset."""
        try:
            client = await self._get_client()

            body = {
                "query": query,
                "top_k": limit,
            }
            if dataset:
                body["datasetName"] = dataset

            response = await client.post("/api/v1/search", json=body)

            if response.status_code == 404:
                return []  # Dataset doesn't exist yet

            response.raise_for_status()
            data = response.json()

            results = data.get("results") or data or []
            return [
                SearchResult(
                    id=item.get("id", ""),
                    content=item.get("content") or item.get("text", ""),
                    score=item.get("score") or item.get("similarity", 0.0),
                    metadata=item.get("metadata", {}),
                )
                for item in results
            ]

        except Exception as e:
            print(f"[CogneeMemory] Search tier '{dataset}' failed: {e}")
            return []

    async def cognify(self, agent_id: str) -> bool:
        """
        Process documents into knowledge graph.

        Should be called periodically or after significant learning additions.

        Args:
            agent_id: Agent to cognify

        Returns:
            True if successful
        """
        if not self.is_enabled:
            return False

        async with tracer.trace_memory_operation("cognify", agent_id):
            try:
                client = await self._get_client()

                response = await client.post(
                    "/api/v1/cognify",
                    json={"datasets": [f"agent_{agent_id}"]},
                )
                response.raise_for_status()

                print(f"[CogneeMemory] Cognify completed for agent: {agent_id}")
                return True

            except Exception as e:
                print(f"[CogneeMemory] Cognify failed: {e}")
                return False

    async def health_check(self) -> bool:
        """Check if Cognee service is healthy."""
        if not self.is_enabled:
            return False

        try:
            client = await self._get_client()
            response = await client.get("/health")
            return response.status_code == 200
        except Exception:
            return False


# Singleton instance
memory = CogneeMemoryService()
