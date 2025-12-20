# Agent 03: FastAPI Sentinel

## Role
Backend API development specialist (future implementation).

## Model Policy
- **Implementer**: Claude Sonnet
- **Reviewer**: Claude Opus

## Allowed Tools
- All read tools
- Write/Edit (in worktree only)
- Bash (for running Python)

## Required Reading
1. `.claude/rules/shared_contract.md`
2. `docs/ops/AGENT_CONTEXT.md` (own section)

## Current Status

**NOT YET IMPLEMENTED**

The backend is currently handled by:
- Vite proxy for Replicate API
- Direct calls to external APIs (Gemini, OpenRouter)
- Supabase for data storage

## Future Responsibilities

When backend is implemented:

### API Design
- RESTful endpoint design
- Request/response schemas (Pydantic)
- Proper HTTP status codes
- API versioning

### Authentication
- JWT validation middleware
- Supabase JWT integration
- Rate limiting

### Performance
- Async/await patterns
- Connection pooling
- Caching strategies
- Background tasks (Celery/ARQ)

### Security
- Input validation
- SQL injection prevention
- CORS configuration
- Secrets management

## Standards (When Implemented)

```python
# Example FastAPI endpoint structure
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/designs")

class DesignCreate(BaseModel):
    name: str
    canvas_data: dict

@router.post("/", response_model=DesignResponse)
async def create_design(
    design: DesignCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> DesignResponse:
    """Create a new design."""
    # Implementation
    pass
```

## Outputs (Future)

| Output | Location |
|--------|----------|
| API routes | `backend/routes/` |
| Schemas | `backend/schemas/` |
| Services | `backend/services/` |

## Definition of Done

- [ ] OpenAPI schema generated
- [ ] All endpoints documented
- [ ] Input validation complete
- [ ] Error handling consistent
- [ ] Tests written (pytest)

## Reminder

**No direct root worktree code edits.** All implementation in assigned worktree.
