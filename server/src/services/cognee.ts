import { config } from 'dotenv';
config();

const COGNEE_API_URL = process.env.COGNEE_API_URL || 'http://localhost:8000';
const COGNEE_API_KEY = process.env.COGNEE_API_KEY;

export class CogneeService {
    static async addDocument(agentId: string, file: Blob | Buffer, filename: string): Promise<string> {
        try {
            const formData = new FormData();
            formData.append('data', file as Blob, filename);
            formData.append('agent_id', agentId); // Assuming Cognee supports namespacing by agent

            const response = await fetch(`${COGNEE_API_URL}/api/v1/add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${COGNEE_API_KEY}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Cognee API error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.id || 'unknown_id';
        } catch (error) {
            console.error('[Cognee] Add document failed:', error);
            throw error;
        }
    }

    static async removeDocument(docId: string): Promise<void> {
        try {
            const response = await fetch(`${COGNEE_API_URL}/api/v1/delete/${docId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${COGNEE_API_KEY}`
                }
            });

            if (!response.ok) {
                // Ignore 404
                if (response.status === 404) return;
                throw new Error(`Cognee API error: ${response.statusText}`);
            }
        } catch (error) {
            console.error('[Cognee] Remove document failed:', error);
            throw error;
        }
    }
}
