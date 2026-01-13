"""
Banner Design Agent

AI agent specialized in generating and refining LinkedIn banner designs.
Uses Pydantic AI with memory integration for personalized suggestions.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Optional

from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext

from cognee_agents.agents.base import NanobannaAgent, AgentDependencies
from cognee_agents.services.cognee_memory import MemoryContext
from cognee_agents.config import settings


# Output Models

class ColorPalette(BaseModel):
    """Color palette for a banner design."""
    primary: str = Field(description="Primary color hex code (e.g., #D4AF37)")
    secondary: str = Field(description="Secondary color hex code")
    accent: str = Field(description="Accent color hex code")
    background: str = Field(description="Background color hex code")
    text: str = Field(description="Text color hex code")


class LayoutSuggestion(BaseModel):
    """Layout suggestion for banner elements."""
    name: str = Field(description="Layout name (e.g., 'centered', 'left-aligned')")
    description: str = Field(description="Layout description")
    text_position: str = Field(description="Text position: 'left', 'center', 'right'")
    image_position: Optional[str] = Field(default=None, description="Image position if applicable")


class BannerDesignOutput(BaseModel):
    """Complete banner design suggestion."""
    title: str = Field(description="Banner title/headline")
    subtitle: Optional[str] = Field(default=None, description="Optional subtitle")
    tagline: Optional[str] = Field(default=None, description="Optional tagline")
    color_palette: ColorPalette = Field(description="Suggested color palette")
    layout: LayoutSuggestion = Field(description="Layout suggestion")
    style: str = Field(description="Design style: 'professional', 'creative', 'minimal', 'bold'")
    font_suggestion: str = Field(description="Suggested font family")
    imagery_prompt: Optional[str] = Field(default=None, description="AI image generation prompt if needed")
    rationale: str = Field(description="Explanation of design choices")


class BannerFeedback(BaseModel):
    """Feedback and refinement suggestions for an existing banner."""
    overall_score: float = Field(ge=0, le=10, description="Overall design score 0-10")
    strengths: list[str] = Field(description="Design strengths")
    improvements: list[str] = Field(description="Suggested improvements")
    specific_changes: list[str] = Field(description="Specific changes to make")
    industry_fit: str = Field(description="How well it fits the target industry")


# Dependencies

@dataclass
class BannerAgentDeps(AgentDependencies):
    """Dependencies for the banner agent."""
    industry: Optional[str] = None
    target_audience: Optional[str] = None
    brand_colors: Optional[list[str]] = None
    existing_design: Optional[dict[str, Any]] = field(default_factory=dict)


# Banner Design Agent

class BannerDesignAgent(NanobannaAgent[BannerAgentDeps, BannerDesignOutput]):
    """
    AI agent for generating LinkedIn banner designs.

    Capabilities:
    - Generate new banner designs based on prompts
    - Consider user preferences from memory
    - Apply industry-specific styling
    - Ensure brand consistency

    Memory Integration:
    - Remembers user's past design preferences
    - Learns from successful designs
    - Adapts to industry trends
    """

    agent_id = "banner_design"

    def _create_agent(self) -> Agent[BannerAgentDeps, BannerDesignOutput]:
        agent = Agent(
            f"openrouter:{settings.default_model}",
            deps_type=BannerAgentDeps,
            output_type=BannerDesignOutput,
            instructions=self._get_instructions(MemoryContext()),
        )

        # Register tools
        @agent.tool
        async def get_industry_trends(ctx: RunContext[BannerAgentDeps], industry: str) -> str:
            """Get current design trends for a specific industry."""
            trends = {
                "technology": "Clean lines, blue/purple gradients, geometric patterns, minimal text",
                "finance": "Navy/gold colors, professional typography, trust symbols",
                "creative": "Bold colors, asymmetric layouts, artistic elements",
                "healthcare": "Soft colors, clean design, trust-building imagery",
                "default": "Professional colors, clear hierarchy, readable fonts"
            }
            return trends.get(industry.lower(), trends["default"])

        @agent.tool
        async def check_color_contrast(ctx: RunContext[BannerAgentDeps], text_color: str, bg_color: str) -> str:
            """Check if text/background color combination has good contrast."""
            # Simplified contrast check
            return "Good contrast - readable" if text_color != bg_color else "Poor contrast - adjust colors"

        @agent.tool
        async def get_user_preferences(ctx: RunContext[BannerAgentDeps]) -> str:
            """Get user's design preferences from memory."""
            if ctx.deps.memory_context.agent_context:
                return f"User preferences from memory: {ctx.deps.memory_context.agent_context[0]}"
            return "No previous preferences found - using defaults"

        return agent

    def _get_instructions(self, memory_context: MemoryContext) -> str:
        base_instructions = """
You are an expert LinkedIn banner designer with deep knowledge of:
- Professional branding and visual identity
- Industry-specific design trends
- Color psychology and accessibility
- Typography for digital platforms
- LinkedIn's design requirements and best practices

Your goal is to create banner designs that:
1. Capture attention within 3 seconds
2. Communicate professional value
3. Are consistent with brand identity
4. Work across all device sizes
5. Follow LinkedIn's technical requirements (1584x396px)

Design Principles:
- Use a maximum of 3-4 colors
- Ensure text is readable at all sizes
- Leave safe zones for profile picture overlap
- Consider mobile cropping
- Avoid cluttered layouts
"""

        if memory_context.agent_context:
            base_instructions += f"""

## User Design History
Based on previous interactions:
{chr(10).join('- ' + ctx for ctx in memory_context.agent_context[:3])}
"""

        if memory_context.global_context:
            base_instructions += f"""

## Current Design Trends
{chr(10).join('- ' + ctx for ctx in memory_context.global_context[:2])}
"""

        return base_instructions

    def _prepare_dependencies(
        self,
        custom_deps: Optional[BannerAgentDeps],
        user_id: str,
        session_id: Optional[str],
        memory_context: MemoryContext,
    ) -> BannerAgentDeps:
        if custom_deps:
            custom_deps.memory_context = memory_context
            custom_deps.user_id = user_id
            custom_deps.session_id = session_id
            return custom_deps

        return BannerAgentDeps(
            user_id=user_id,
            session_id=session_id,
            memory_context=memory_context,
        )


# Banner Feedback Agent

class BannerFeedbackAgent(NanobannaAgent[BannerAgentDeps, BannerFeedback]):
    """
    AI agent for analyzing and providing feedback on banner designs.

    Capabilities:
    - Analyze existing banner designs
    - Provide actionable feedback
    - Score designs against best practices
    - Suggest specific improvements
    """

    agent_id = "banner_feedback"

    def _create_agent(self) -> Agent[BannerAgentDeps, BannerFeedback]:
        agent = Agent(
            f"openrouter:{settings.default_model}",
            deps_type=BannerAgentDeps,
            output_type=BannerFeedback,
            instructions=self._get_instructions(MemoryContext()),
        )

        @agent.tool
        async def analyze_color_harmony(ctx: RunContext[BannerAgentDeps], colors: list[str]) -> str:
            """Analyze if the colors work well together."""
            if len(colors) <= 3:
                return "Good - limited color palette promotes cohesion"
            elif len(colors) <= 5:
                return "Acceptable - consider reducing colors for cleaner look"
            else:
                return "Too many colors - simplify palette for better impact"

        @agent.tool
        async def check_text_readability(ctx: RunContext[BannerAgentDeps], font_size: int, text_length: int) -> str:
            """Check if text will be readable on LinkedIn."""
            if font_size < 16:
                return "Font too small for mobile - increase to 18px minimum"
            if text_length > 50:
                return "Text too long - consider shortening for quick readability"
            return "Text size and length are appropriate"

        return agent

    def _get_instructions(self, memory_context: MemoryContext) -> str:
        return """
You are a design critic specializing in LinkedIn banner evaluation.

Evaluation Criteria:
1. Visual Impact (0-10): Does it grab attention?
2. Brand Consistency (0-10): Does it align with professional identity?
3. Readability (0-10): Is text clear at all sizes?
4. Technical Quality (0-10): Resolution, safe zones, cropping
5. Industry Fit (0-10): Appropriate for target industry?

Provide:
- Honest but constructive feedback
- Specific, actionable improvements
- Priority ranking for changes
- Industry-specific recommendations

Be encouraging while being thorough. Focus on what will have the biggest impact.
"""

    def _prepare_dependencies(
        self,
        custom_deps: Optional[BannerAgentDeps],
        user_id: str,
        session_id: Optional[str],
        memory_context: MemoryContext,
    ) -> BannerAgentDeps:
        if custom_deps:
            custom_deps.memory_context = memory_context
            custom_deps.user_id = user_id
            custom_deps.session_id = session_id
            return custom_deps

        return BannerAgentDeps(
            user_id=user_id,
            session_id=session_id,
            memory_context=memory_context,
        )


# Singleton instances
banner_design_agent = BannerDesignAgent()
banner_feedback_agent = BannerFeedbackAgent()
