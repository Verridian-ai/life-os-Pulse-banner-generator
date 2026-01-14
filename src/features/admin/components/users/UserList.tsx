import React, { useState, useEffect, useCallback } from 'react';
import { listUsers, type ListUsersResponse } from '../../services/adminApi';
import type { AdminUser } from '../../types';

type UserListProps = {
  onSelectUser: (userId: string) => void;
};

export function UserList({ onSelectUser }: UserListProps): React.ReactElement {
  const [data, setData] = useState<ListUsersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await listUsers({ page, search, limit: 20 });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-bold text-white'>Users</h2>
          <p className='text-zinc-400 text-sm mt-1'>{data?.pagination.total ?? 0} total users</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className='flex gap-2'>
          <div className='relative'>
            <span className='material-icons absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-lg'>
              search
            </span>
            <input
              type='text'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder='Search users...'
              className='w-64 pl-10 pr-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition'
            />
          </div>
          <button
            type='submit'
            className='px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition'
          >
            Search
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className='p-4 bg-red-500/10 border border-red-500/30 rounded-xl'>
          <div className='flex items-center gap-3 text-red-400'>
            <span className='material-icons'>error</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className='bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-white/5'>
                <th className='text-left px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider'>
                  User
                </th>
                <th className='text-left px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider'>
                  Credits
                </th>
                <th className='text-left px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider'>
                  Images
                </th>
                <th className='text-left px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider'>
                  Joined
                </th>
                <th className='text-right px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-white/5'>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className='px-6 py-12 text-center'>
                    <span className='material-icons text-3xl text-purple-500 animate-spin'>
                      sync
                    </span>
                  </td>
                </tr>
              ) : data?.users.length === 0 ? (
                <tr>
                  <td colSpan={5} className='px-6 py-12 text-center text-zinc-500'>
                    No users found
                  </td>
                </tr>
              ) : (
                data?.users.map((user: AdminUser) => (
                  <tr
                    key={user.id}
                    className='hover:bg-white/5 transition cursor-pointer'
                    onClick={() => onSelectUser(user.id)}
                  >
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center'>
                          {user.profile?.avatarUrl ? (
                            <img
                              src={user.profile.avatarUrl}
                              alt=''
                              className='w-full h-full rounded-full object-cover'
                            />
                          ) : (
                            <span className='material-icons text-white text-lg'>person</span>
                          )}
                        </div>
                        <div>
                          <p className='text-white font-medium'>
                            {user.profile?.fullName || user.profile?.username || 'No name'}
                          </p>
                          <p className='text-zinc-500 text-sm'>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <span className='text-white font-medium'>{user.credits?.balance ?? 0}</span>
                    </td>
                    <td className='px-6 py-4'>
                      <span className='text-zinc-400'>{user.profile?.imagesGenerated ?? 0}</span>
                    </td>
                    <td className='px-6 py-4'>
                      <span className='text-zinc-400 text-sm'>{formatDate(user.createdAt)}</span>
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectUser(user.id);
                        }}
                        className='inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-sm transition'
                      >
                        View
                        <span className='material-icons text-lg'>chevron_right</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className='px-6 py-4 border-t border-white/5 flex items-center justify-between'>
            <p className='text-zinc-500 text-sm'>
              Page {data.pagination.page} of {data.pagination.totalPages}
            </p>
            <div className='flex gap-2'>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className='px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition'
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
                className='px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition'
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
