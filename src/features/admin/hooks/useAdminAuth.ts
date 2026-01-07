import { useState, useEffect, useCallback } from 'react';
import { checkAdminStatus } from '../services/adminApi';
import type { AdminStatus, AdminPermissions } from '../types';

type UseAdminAuthResult = {
    isAdmin: boolean;
    isLoading: boolean;
    error: string | null;
    role: string | null;
    permissions: AdminPermissions | null;
    hasPermission: (permission: keyof AdminPermissions) => boolean;
    refresh: () => Promise<void>;
};

export function useAdminAuth(): UseAdminAuthResult {
    const [status, setStatus] = useState<AdminStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadAdminStatus = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await checkAdminStatus();
            setStatus(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to check admin status');
            setStatus({ isAdmin: false });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAdminStatus();
    }, [loadAdminStatus]);

    const hasPermission = useCallback(
        (permission: keyof AdminPermissions): boolean => {
            if (!status?.isAdmin) return false;
            if (status.role === 'super_admin') return true;
            return status.permissions?.[permission] ?? false;
        },
        [status]
    );

    return {
        isAdmin: status?.isAdmin ?? false,
        isLoading,
        error,
        role: status?.role ?? null,
        permissions: status?.permissions ?? null,
        hasPermission,
        refresh: loadAdminStatus,
    };
}
