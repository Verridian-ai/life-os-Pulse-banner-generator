import { api } from './api';

export interface EmailLog {
    id?: string;
    recipient: string;
    subject: string;
    status: 'sent' | 'failed' | 'queued';
    template_name?: string;
    error_message?: string;
    created_at?: string;
}

/**
 * Service to handle email operations and logging via backend API
 */
export const emailService = {
    /**
     * Log an email attempt via backend API
     */
    async logEmail(log: Omit<EmailLog, 'id' | 'created_at'>) {
        try {
            const data = await api.post<{ success?: boolean; error?: string; data?: EmailLog }>('/api/email-logs', log);

            if (data.error) {
                console.error('Failed to log email:', data.error);
                return { success: false, error: data.error };
            }

            return { success: true, data: data.data };
        } catch (e) {
            console.error('Exception logging email:', e);
            return { success: false, error: e };
        }
    },

    /**
     * Fetch recent email logs via backend API
     */
    async getLogs(limit = 50) {
        try {
            const data = await api.get<{ logs?: EmailLog[]; error?: string }>(`/api/email-logs?limit=${limit}`);

            if (data.error) throw new Error(data.error);
            return data.logs || [];
        } catch (e) {
            console.error('Exception fetching email logs:', e);
            throw e;
        }
    },
};
