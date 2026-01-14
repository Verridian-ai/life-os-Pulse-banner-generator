import React, { useState, useEffect, useCallback } from 'react';
import {
  getUserDetail,
  updateUser,
  addCredits,
  grantAdminPrivileges,
  revokeAdminPrivileges,
} from '../../services/adminApi';
import type { AdminUserDetail } from '../../types';
import { useAdminAuth } from '../../hooks/useAdminAuth';

type UserDetailProps = {
  userId: string;
  onClose: () => void;
};

export function UserDetail({ userId, onClose }: UserDetailProps): React.ReactElement {
  const { role: currentUserRole } = useAdminAuth();
  const [data, setData] = useState<AdminUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [creditDescription, setCreditDescription] = useState('');

  const loadUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getUserDetail(userId);
      setData(result);
      setFullName(result.profile?.fullName || '');
      setUsername(result.profile?.username || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleSave = async () => {
    try {
      setError(null);
      await updateUser(userId, { fullName, username });
      setSuccessMessage('User updated successfully');
      setEditMode(false);
      loadUser();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const handleAddCredits = async () => {
    const amount = parseInt(creditAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid credit amount');
      return;
    }

    try {
      setError(null);
      await addCredits(userId, amount, creditDescription);
      setSuccessMessage(`Added ${amount} credits`);
      setCreditAmount('');
      setCreditDescription('');
      loadUser();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add credits');
    }
  };

  const handleToggleAdmin = async () => {
    try {
      setError(null);
      if (data?.isAdmin) {
        await revokeAdminPrivileges(userId);
        setSuccessMessage('Admin privileges revoked');
      } else {
        await grantAdminPrivileges(userId);
        setSuccessMessage('Admin privileges granted');
      }
      loadUser();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update admin status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50'>
        <div className='bg-zinc-900 rounded-2xl p-8 text-center'>
          <span className='material-icons text-4xl text-purple-500 animate-spin'>sync</span>
          <p className='text-zinc-400 mt-4'>Loading user...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50'>
        <div className='bg-zinc-900 rounded-2xl p-8 text-center max-w-md'>
          <span className='material-icons text-4xl text-red-500'>error</span>
          <p className='text-white mt-4'>User not found</p>
          <button
            onClick={onClose}
            className='mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition'
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto'>
      <div className='bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-2xl my-8'>
        {/* Header */}
        <div className='p-6 border-b border-white/5 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center'>
              {data.profile?.avatarUrl ? (
                <img
                  src={data.profile.avatarUrl}
                  alt=''
                  className='w-full h-full rounded-full object-cover'
                />
              ) : (
                <span className='material-icons text-white text-2xl'>person</span>
              )}
            </div>
            <div>
              <h2 className='text-xl font-bold text-white'>
                {data.profile?.fullName || data.profile?.username || 'No name'}
              </h2>
              <p className='text-zinc-400'>{data.user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition'
          >
            <span className='material-icons'>close</span>
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className='mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg'>
            <p className='text-red-400 text-sm'>{error}</p>
          </div>
        )}
        {successMessage && (
          <div className='mx-6 mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg'>
            <p className='text-green-400 text-sm'>{successMessage}</p>
          </div>
        )}

        {/* Content */}
        <div className='p-6 space-y-6'>
          {/* Profile Info */}
          <div className='bg-zinc-800/50 rounded-xl p-4 space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-white font-semibold'>Profile</h3>
              <button
                onClick={() => setEditMode(!editMode)}
                className='text-purple-400 hover:text-purple-300 text-sm transition'
              >
                {editMode ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editMode ? (
              <div className='space-y-3'>
                <div>
                  <label className='text-zinc-400 text-xs block mb-1'>Full Name</label>
                  <input
                    type='text'
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className='w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500'
                  />
                </div>
                <div>
                  <label className='text-zinc-400 text-xs block mb-1'>Username</label>
                  <input
                    type='text'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className='w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500'
                  />
                </div>
                <button
                  onClick={handleSave}
                  className='px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition'
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-zinc-500 text-xs'>Full Name</p>
                  <p className='text-white'>{data.profile?.fullName || '—'}</p>
                </div>
                <div>
                  <p className='text-zinc-500 text-xs'>Username</p>
                  <p className='text-white'>@{data.profile?.username || '—'}</p>
                </div>
                <div>
                  <p className='text-zinc-500 text-xs'>Joined</p>
                  <p className='text-white'>{formatDate(data.user.createdAt)}</p>
                </div>
                <div>
                  <p className='text-zinc-500 text-xs'>Images Generated</p>
                  <p className='text-white'>{data.profile?.imagesGenerated ?? 0}</p>
                </div>
              </div>
            )}
          </div>

          {/* Credits */}
          <div className='bg-zinc-800/50 rounded-xl p-4 space-y-4'>
            <h3 className='text-white font-semibold'>Credits</h3>
            <div className='grid grid-cols-3 gap-4'>
              <div className='bg-zinc-900/50 rounded-lg p-3 text-center'>
                <p className='text-2xl font-bold text-white'>
                  {data.creditAccount?.creditBalance ?? 0}
                </p>
                <p className='text-zinc-500 text-xs'>Current Balance</p>
              </div>
              <div className='bg-zinc-900/50 rounded-lg p-3 text-center'>
                <p className='text-2xl font-bold text-zinc-400'>
                  {data.creditAccount?.lifetimeCreditsUsed ?? 0}
                </p>
                <p className='text-zinc-500 text-xs'>Total Used</p>
              </div>
              <div className='bg-zinc-900/50 rounded-lg p-3 text-center'>
                <p className='text-2xl font-bold text-green-400'>
                  {data.creditAccount?.lifetimeCreditsGranted ?? 0}
                </p>
                <p className='text-zinc-500 text-xs'>Total Granted</p>
              </div>
            </div>

            {/* Add Credits Form */}
            <div className='flex gap-2 pt-2'>
              <input
                type='number'
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                placeholder='Amount'
                className='w-24 px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500'
              />
              <input
                type='text'
                value={creditDescription}
                onChange={(e) => setCreditDescription(e.target.value)}
                placeholder='Reason (optional)'
                className='flex-1 px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500'
              />
              <button
                onClick={handleAddCredits}
                className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition'
              >
                Add Credits
              </button>
            </div>
          </div>

          {/* Admin Status */}
          {currentUserRole === 'super_admin' && (
            <div className='bg-zinc-800/50 rounded-xl p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-white font-semibold'>Admin Status</h3>
                  <p className='text-zinc-400 text-sm'>
                    {data.isAdmin
                      ? `This user is an ${data.adminRole}`
                      : 'This user is not an admin'}
                  </p>
                </div>
                <button
                  onClick={handleToggleAdmin}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    data.isAdmin
                      ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                      : 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30'
                  }`}
                >
                  {data.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                </button>
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          {data.recentTransactions.length > 0 && (
            <div className='bg-zinc-800/50 rounded-xl p-4'>
              <h3 className='text-white font-semibold mb-3'>Recent Transactions</h3>
              <div className='space-y-2'>
                {data.recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className='flex items-center justify-between py-2 border-b border-white/5 last:border-0'
                  >
                    <div>
                      <p className='text-white text-sm'>{tx.description || tx.type}</p>
                      <p className='text-zinc-500 text-xs'>{formatDate(tx.createdAt)}</p>
                    </div>
                    <span
                      className={`font-medium ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {tx.amount > 0 ? '+' : ''}
                      {tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
