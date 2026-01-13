/**
 * Cognee API Routes - Public endpoints for agent knowledge retrieval
 *
 * These endpoints allow the frontend to query Cognee for agent context
 * without exposing the full admin interface.
 */

import { Hono } from 'hono';
import { authMiddleware } from '../lib/auth';
import { CogneeService } from '../services/cognee';
import { aiRateLimit } from '../lib/rateLimit';

type Variables = {
  user: { id: string } | null;
};

export const cogneeRouter = new Hono<{ Variables: Variables }>();

// Apply rate limiting to prevent abuse
cogneeRouter.use('*', aiRateLimit);

/**
 * POST /api/cognee/search
 * Search agent knowledge base with semantic query
 */
cogneeRouter.post('/search', authMiddleware, async (c) => {
  try {
    const { query, agentId, limit = 3 } = await c.req.json();

    if (!query || typeof query !== 'string') {
      return c.json({ error: 'Query is required' }, 400);
    }

    if (!agentId || typeof agentId !== 'string') {
      return c.json({ error: 'Agent ID is required' }, 400);
    }

    // Sanitize inputs
    const sanitizedQuery = query.slice(0, 500);
    const sanitizedAgentId = agentId.replace(/[^a-z0-9-_]/gi, '');
    const limitNum = Math.min(Math.max(1, Number(limit)), 10);

    const results = await CogneeService.search(sanitizedQuery, sanitizedAgentId, limitNum);

    return c.json({
      results,
      query: sanitizedQuery,
      agentId: sanitizedAgentId,
    });
  } catch (error) {
    console.error('[Cognee Route] Search failed:', error);
    return c.json({ error: 'Search failed', results: [] }, 500);
  }
});

/**
 * GET /api/cognee/agent/:agentId/context
 * Get all context documents for a specific agent
 */
cogneeRouter.get('/agent/:agentId/context', authMiddleware, async (c) => {
  try {
    const agentId = c.req.param('agentId');

    if (!agentId) {
      return c.json({ error: 'Agent ID is required' }, 400);
    }

    // Sanitize agent ID
    const sanitizedAgentId = agentId.replace(/[^a-z0-9-_]/gi, '');

    const documents = await CogneeService.getAgentContext(sanitizedAgentId);

    return c.json({
      documents,
      agentId: sanitizedAgentId,
      count: documents.length,
    });
  } catch (error) {
    console.error('[Cognee Route] Get agent context failed:', error);
    return c.json({ error: 'Failed to fetch agent context', documents: [] }, 500);
  }
});

/**
 * POST /api/cognee/query
 * Query agent knowledge with natural language and get an answer
 */
cogneeRouter.post('/query', authMiddleware, async (c) => {
  try {
    const { question, agentId } = await c.req.json();

    if (!question || typeof question !== 'string') {
      return c.json({ error: 'Question is required' }, 400);
    }

    if (!agentId || typeof agentId !== 'string') {
      return c.json({ error: 'Agent ID is required' }, 400);
    }

    // Sanitize inputs
    const sanitizedQuestion = question.slice(0, 1000);
    const sanitizedAgentId = agentId.replace(/[^a-z0-9-_]/gi, '');

    const result = await CogneeService.query(sanitizedQuestion, sanitizedAgentId);

    return c.json({
      answer: result.answer,
      sources: result.sources,
      question: sanitizedQuestion,
      agentId: sanitizedAgentId,
    });
  } catch (error) {
    console.error('[Cognee Route] Query failed:', error);
    return c.json({
      error: 'Query failed',
      answer: '',
      sources: [],
    }, 500);
  }
});

/**
 * GET /api/cognee/health
 * Check Cognee service health
 */
cogneeRouter.get('/health', async (c) => {
  try {
    const isHealthy = await CogneeService.healthCheck();
    return c.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      service: 'cognee',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cognee Route] Health check failed:', error);
    return c.json({
      status: 'unhealthy',
      service: 'cognee',
      error: 'Connection failed',
      timestamp: new Date().toISOString(),
    }, 503);
  }
});

export default cogneeRouter;
