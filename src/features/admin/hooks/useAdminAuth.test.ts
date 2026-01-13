import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useAdminAuth } from './useAdminAuth';
import * as adminApi from '../services/adminApi';
import type { AdminStatus, AdminPermissions } from '../types';

// Mock the admin API
vi.mock('../services/adminApi', () => ({
    checkAdminStatus: vi.fn(),
}));

const mockCheckAdminStatus = vi.mocked(adminApi.checkAdminStatus);

describe('useAdminAuth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('loading state', () => {
        it('should start with loading state true', async () => {
            mockCheckAdminStatus.mockImplementation(
                () => new Promise(() => {}) // Never resolves
            );

            const { result } = renderHook(() => useAdminAuth());

            expect(result.current.isLoading).toBe(true);
            expect(result.current.isAdmin).toBe(false);
            expect(result.current.error).toBeNull();
        });

        it('should set loading to false after successful check', async () => {
            const mockStatus: AdminStatus = {
                isAdmin: true,
                role: 'admin',
                permissions: {
                    user_management: true,
                    agent_configuration: true,
                    audit_log_access: true,
                    system_settings: false,
                    observability_config: false,
                    financial_access: false,
                },
            };
            mockCheckAdminStatus.mockResolvedValue(mockStatus);

            const { result } = renderHook(() => useAdminAuth());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
        });

        it('should set loading to false after failed check', async () => {
            mockCheckAdminStatus.mockRejectedValue(new Error('Network error'));

            const { result } = renderHook(() => useAdminAuth());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
        });
    });

    describe('admin status', () => {
        it('should return isAdmin true for authenticated admin', async () => {
            const mockStatus: AdminStatus = {
                isAdmin: true,
                role: 'admin',
            };
            mockCheckAdminStatus.mockResolvedValue(mockStatus);

            const { result } = renderHook(() => useAdminAuth());

            await waitFor(() => {
                expect(result.current.isAdmin).toBe(true);
                expect(result.current.role).toBe('admin');
            });
        });

        it('should return isAdmin false for non-admin users', async () => {
            const mockStatus: AdminStatus = {
                isAdmin: false,
            };
            mockCheckAdminStatus.mockResolvedValue(mockStatus);

            const { result } = renderHook(() => useAdminAuth());

            await waitFor(() => {
                expect(result.current.isAdmin).toBe(false);
                expect(result.current.role).toBeNull();
            });
        });

        it('should return super_admin role correctly', async () => {
            const mockStatus: AdminStatus = {
                isAdmin: true,
                role: 'super_admin',
            };
            mockCheckAdminStatus.mockResolvedValue(mockStatus);

            const { result } = renderHook(() => useAdminAuth());

            await waitFor(() => {
                expect(result.current.isAdmin).toBe(true);
                expect(result.current.role).toBe('super_admin');
            });
        });
    });

    describe('error handling', () => {
        it('should set error message when API fails', async () => {
            mockCheckAdminStatus.mockRejectedValue(new Error('Authentication failed'));

            const { result } = renderHook(() => useAdminAuth());

            await waitFor(() => {
                expect(result.current.error).toBe('Authentication failed');
                expect(result.current.isAdmin).toBe(false);
            });
        });

        it('should handle non-Error exceptions', async () => {
            mockCheckAdminStatus.mockRejectedValue('Unknown error');

            const { result } = renderHook(() => useAdminAuth());

            await waitFor(() => {
                expect(result.current.error).toBe('Failed to check admin status');
                expect(result.current.isAdmin).toBe(false);
            });
        });
    });

    describe('permissions', () => {
        // Full permissions config used for comprehensive test scenarios
        const _fullPermissions: AdminPermissions = {
            user_management: true,
            agent_configuration: true,
            audit_log_access: true,
            system_settings: true,
            observability_config: true,
            financial_access: true,
        };
        void _fullPermissions; // Reserved for expanded permission tests

        const partialPermissions: AdminPermissions = {
            user_management: true,
            agent_configuration: true,
            audit_log_access: false,
            system_settings: false,
            observability_config: false,
            financial_access: false,
        };

        it('should return permissions for admin user', async () => {
            mockCheckAdminStatus.mockResolvedValue({
                isAdmin: true,
                role: 'admin',
                permissions: partialPermissions,
            });

            const { result } = renderHook(() => useAdminAuth());

            await waitFor(() => {
                expect(result.current.permissions).toEqual(partialPermissions);
            });
        });

        it('should return null permissions for non-admin', async () => {
            mockCheckAdminStatus.mockResolvedValue({
                isAdmin: false,
            });

            const { result } = renderHook(() => useAdminAuth());

            await waitFor(() => {
                expect(result.current.permissions).toBeNull();
            });
        });

        describe('hasPermission', () => {
            it('should return true for super_admin on any permission', async () => {
                mockCheckAdminStatus.mockResolvedValue({
                    isAdmin: true,
                    role: 'super_admin',
                    permissions: partialPermissions, // Even with partial, super_admin gets all
                });

                const { result } = renderHook(() => useAdminAuth());

                await waitFor(() => {
                    expect(result.current.hasPermission('user_management')).toBe(true);
                    expect(result.current.hasPermission('financial_access')).toBe(true);
                    expect(result.current.hasPermission('system_settings')).toBe(true);
                });
            });

            it('should check actual permissions for regular admin', async () => {
                mockCheckAdminStatus.mockResolvedValue({
                    isAdmin: true,
                    role: 'admin',
                    permissions: partialPermissions,
                });

                const { result } = renderHook(() => useAdminAuth());

                await waitFor(() => {
                    expect(result.current.hasPermission('user_management')).toBe(true);
                    expect(result.current.hasPermission('agent_configuration')).toBe(true);
                    expect(result.current.hasPermission('financial_access')).toBe(false);
                    expect(result.current.hasPermission('system_settings')).toBe(false);
                });
            });

            it('should return false for non-admin users', async () => {
                mockCheckAdminStatus.mockResolvedValue({
                    isAdmin: false,
                });

                const { result } = renderHook(() => useAdminAuth());

                await waitFor(() => {
                    expect(result.current.hasPermission('user_management')).toBe(false);
                    expect(result.current.hasPermission('financial_access')).toBe(false);
                });
            });
        });
    });

    describe('refresh', () => {
        it('should refresh admin status when called', async () => {
            const initialStatus: AdminStatus = { isAdmin: false };
            const updatedStatus: AdminStatus = { isAdmin: true, role: 'admin' };

            mockCheckAdminStatus.mockResolvedValueOnce(initialStatus);

            const { result } = renderHook(() => useAdminAuth());

            await waitFor(() => {
                expect(result.current.isAdmin).toBe(false);
            });

            mockCheckAdminStatus.mockResolvedValueOnce(updatedStatus);

            await act(async () => {
                await result.current.refresh();
            });

            await waitFor(() => {
                expect(result.current.isAdmin).toBe(true);
                expect(result.current.role).toBe('admin');
            });

            expect(mockCheckAdminStatus).toHaveBeenCalledTimes(2);
        });

        it('should handle refresh errors gracefully', async () => {
            const initialStatus: AdminStatus = { isAdmin: true, role: 'admin' };

            mockCheckAdminStatus.mockResolvedValueOnce(initialStatus);

            const { result } = renderHook(() => useAdminAuth());

            await waitFor(() => {
                expect(result.current.isAdmin).toBe(true);
            });

            mockCheckAdminStatus.mockRejectedValueOnce(new Error('Session expired'));

            await act(async () => {
                await result.current.refresh();
            });

            await waitFor(() => {
                expect(result.current.error).toBe('Session expired');
                expect(result.current.isAdmin).toBe(false);
            });
        });
    });
});
