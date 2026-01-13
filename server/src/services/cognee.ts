import { config } from 'dotenv';
config();

const COGNEE_API_URL = process.env.COGNEE_API_URL || 'http://localhost:8000';
const COGNEE_API_KEY = process.env.COGNEE_API_KEY;

// Types for Cognee API responses
export interface CogneeSearchResult {
    id: string;
    content: string;
    score: number;
    metadata?: Record<string, unknown>;
}

export interface CogneeContextDocument {
    id: string;
    filename: string;
    content: string;
    agentId: string;
    createdAt: string;
}

export interface CogneeQueryResponse {
    answer: string;
    sources: CogneeSearchResult[];
}

/**
 * CogneeService - Self-hosted AI Memory Service
 *
 * Provides knowledge graph and vector search capabilities for AI agents.
 * Deployed as a separate Cloud Run service.
 */
export class CogneeService {
    private static getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (COGNEE_API_KEY) {
            headers['Authorization'] = `Bearer ${COGNEE_API_KEY}`;
        }
        return headers;
    }

    /**
     * Add a document to Cognee for processing
     * @param agentId - The agent namespace for the document
     * @param file - The file content
     * @param filename - The filename
     * @returns Document ID
     */
    static async addDocument(agentId: string, file: Blob | Buffer, filename: string): Promise<string> {
        try {
            const formData = new FormData();
            formData.append('data', file as Blob, filename);
            // Use datasetName for agent-specific namespacing (camelCase for Cognee API)
            formData.append('datasetName', `agent_${agentId}`);

            const response = await fetch(`${COGNEE_API_URL}/api/v1/add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${COGNEE_API_KEY}`
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Cognee API error: ${response.status} - ${error}`);
            }

            const data = await response.json();
            console.log('[Cognee] Document added:', data);
            return data.id || data.document_id || 'unknown_id';
        } catch (error) {
            console.error('[Cognee] Add document failed:', error);
            throw error;
        }
    }

    /**
     * Add text content directly to Cognee
     * @param agentId - The agent namespace
     * @param content - Text content to add
     * @param metadata - Optional metadata
     * @returns Document ID
     */
    static async addText(agentId: string, content: string, metadata?: Record<string, unknown>): Promise<string> {
        try {
            // Convert text content to a Blob and send as multipart/form-data
            const blob = new Blob([content], { type: 'text/plain' });
            const formData = new FormData();
            formData.append('data', blob, 'content.txt');
            formData.append('datasetName', `agent_${agentId}`);

            if (metadata) {
                formData.append('metadata', JSON.stringify(metadata));
            }

            const response = await fetch(`${COGNEE_API_URL}/api/v1/add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${COGNEE_API_KEY}`
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Cognee API error: ${response.status} - ${error}`);
            }

            const data = await response.json();
            console.log('[Cognee] Text added:', data);
            return data.id || data.document_id || 'unknown_id';
        } catch (error) {
            console.error('[Cognee] Add text failed:', error);
            throw error;
        }
    }

    /**
     * Process documents into knowledge graph (cognify)
     * @param agentId - The agent namespace to process
     */
    static async cognify(agentId: string): Promise<void> {
        try {
            const response = await fetch(`${COGNEE_API_URL}/api/v1/cognify`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    datasets: [`agent_${agentId}`]
                })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Cognee API error: ${response.status} - ${error}`);
            }

            console.log('[Cognee] Cognify completed for agent:', agentId);
        } catch (error) {
            console.error('[Cognee] Cognify failed:', error);
            throw error;
        }
    }

    /**
     * Search the knowledge base
     * @param query - Search query
     * @param agentId - Optional agent namespace to search within
     * @param limit - Maximum results to return
     * @returns Search results
     */
    static async search(query: string, agentId?: string, limit = 10): Promise<CogneeSearchResult[]> {
        try {
            const body: Record<string, unknown> = {
                query,
                top_k: limit
            };

            if (agentId) {
                body.datasetName = `agent_${agentId}`;
            }

            const response = await fetch(`${COGNEE_API_URL}/api/v1/search`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Cognee API error: ${response.status} - ${error}`);
            }

            const data = await response.json();
            console.log('[Cognee] Search results:', data.length || 0);

            // Normalize response format
            const results: CogneeSearchResult[] = (data.results || data || []).map((item: Record<string, unknown>) => ({
                id: item.id as string || '',
                content: item.content as string || item.text as string || '',
                score: item.score as number || item.similarity as number || 0,
                metadata: item.metadata as Record<string, unknown> || {}
            }));

            return results;
        } catch (error) {
            console.error('[Cognee] Search failed:', error);
            throw error;
        }
    }

    /**
     * Query the knowledge graph with natural language
     * @param question - Natural language question
     * @param agentId - Agent namespace for context
     * @returns Answer with sources
     */
    static async query(question: string, agentId: string): Promise<CogneeQueryResponse> {
        try {
            // First search for relevant context
            const searchResults = await this.search(question, agentId, 5);

            // If Cognee has a dedicated query endpoint, use it
            // Otherwise, return search results formatted as query response
            const response = await fetch(`${COGNEE_API_URL}/api/v1/search`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    query: question,
                    datasetName: `agent_${agentId}`,
                    search_type: 'INSIGHTS', // Use graph-based search
                    top_k: 5
                })
            });

            if (!response.ok) {
                // Fallback to basic search results
                return {
                    answer: searchResults.map(r => r.content).join('\n\n'),
                    sources: searchResults
                };
            }

            const data = await response.json();

            return {
                answer: data.answer || data.response || searchResults.map(r => r.content).join('\n\n'),
                sources: searchResults
            };
        } catch (error) {
            console.error('[Cognee] Query failed:', error);
            throw error;
        }
    }

    /**
     * Get all context documents for an agent
     * @param agentId - Agent ID
     * @returns List of context documents
     */
    static async getAgentContext(agentId: string): Promise<CogneeContextDocument[]> {
        try {
            // Search with empty query to get all documents for the agent
            const response = await fetch(`${COGNEE_API_URL}/api/v1/datasets/agent_${agentId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return []; // No documents for this agent yet
                }
                const error = await response.text();
                throw new Error(`Cognee API error: ${response.status} - ${error}`);
            }

            const data = await response.json();

            // Normalize response
            const documents: CogneeContextDocument[] = (data.documents || data || []).map((doc: Record<string, unknown>) => ({
                id: doc.id as string || '',
                filename: doc.filename as string || doc.name as string || 'unknown',
                content: doc.content as string || doc.text as string || '',
                agentId: agentId,
                createdAt: doc.created_at as string || doc.createdAt as string || new Date().toISOString()
            }));

            return documents;
        } catch (error) {
            console.error('[Cognee] Get agent context failed:', error);
            throw error;
        }
    }

    /**
     * Remove a document from Cognee
     * @param docId - Document ID to remove
     */
    static async removeDocument(docId: string): Promise<void> {
        try {
            const response = await fetch(`${COGNEE_API_URL}/api/v1/delete/${docId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                // Ignore 404 - document doesn't exist
                if (response.status === 404) return;
                const error = await response.text();
                throw new Error(`Cognee API error: ${response.status} - ${error}`);
            }

            console.log('[Cognee] Document removed:', docId);
        } catch (error) {
            console.error('[Cognee] Remove document failed:', error);
            throw error;
        }
    }

    /**
     * Clear all data for an agent
     * @param agentId - Agent ID
     */
    static async clearAgentData(agentId: string): Promise<void> {
        try {
            const response = await fetch(`${COGNEE_API_URL}/api/v1/datasets/agent_${agentId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (!response.ok && response.status !== 404) {
                const error = await response.text();
                throw new Error(`Cognee API error: ${response.status} - ${error}`);
            }

            console.log('[Cognee] Agent data cleared:', agentId);
        } catch (error) {
            console.error('[Cognee] Clear agent data failed:', error);
            throw error;
        }
    }

    /**
     * Health check for Cognee service
     * @returns True if service is healthy
     */
    static async healthCheck(): Promise<boolean> {
        try {
            const response = await fetch(`${COGNEE_API_URL}/health`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            return response.ok;
        } catch (error) {
            console.error('[Cognee] Health check failed:', error);
            return false;
        }
    }
}
