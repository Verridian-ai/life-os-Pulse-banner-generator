import { supabase } from './supabase';

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
 * Service to handle email operations and logging
 */
export const emailService = {
    /**
     * Log an email attempt to Supabase
     */
    async logEmail(log: Omit<EmailLog, 'id' | 'created_at'>) {
        try {
            const { data, error } = await supabase
                .from('email_logs')
                .insert([log])
                .select()
                .single();

            if (error) {
                console.error('Failed to log email:', error);
                return { success: false, error };
            }

            return { success: true, data };
        } catch (e) {
            console.error('Exception logging email:', e);
            return { success: false, error: e };
        }
    },

    /**
     * Fetch recent email logs
     */
    async getLogs(limit = 50) {
        const { data, error } = await supabase
            .from('email_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }
};
