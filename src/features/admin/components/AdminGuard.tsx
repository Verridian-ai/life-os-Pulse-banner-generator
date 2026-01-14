import React from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';

type AdminGuardProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function AdminGuard({ children, fallback }: AdminGuardProps): React.ReactElement | null {
  const { isAdmin, isLoading, error } = useAdminAuth();

  if (isLoading) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-purple-600/20 rounded-2xl mb-4'>
            <span className='material-icons text-3xl text-purple-500 animate-spin'>sync</span>
          </div>
          <p className='text-zinc-400 text-sm'>Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center max-w-md mx-auto p-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-red-600/20 rounded-2xl mb-4'>
            <span className='material-icons text-3xl text-red-500'>error</span>
          </div>
          <h2 className='text-xl font-bold text-white mb-2'>Error</h2>
          <p className='text-zinc-400 text-sm mb-4'>{error}</p>
          <a
            href='/'
            className='inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition'
          >
            <span className='material-icons text-lg'>arrow_back</span>
            Return Home
          </a>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center max-w-md mx-auto p-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-amber-600/20 rounded-2xl mb-4'>
            <span className='material-icons text-3xl text-amber-500'>lock</span>
          </div>
          <h2 className='text-xl font-bold text-white mb-2'>Access Denied</h2>
          <p className='text-zinc-400 text-sm mb-4'>
            You don't have permission to access the admin dashboard.
            <br />
            <span className='text-xs text-zinc-500 mt-2 block'>
              (Ensure you are logged in with an admin account. Try logging out and back in.)
            </span>
          </p>
          <a
            href='/'
            className='inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition'
          >
            <span className='material-icons text-lg'>arrow_back</span>
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
