import React, { useState, useEffect } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useAuth } from '../../context/AuthContext';

interface UserPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserPreferencesModal: React.FC<UserPreferencesModalProps> = ({ isOpen, onClose }) => {
  const { updateTimeoutSettings, timeoutDuration, user, authUser } = useAuth();

  const [sessionTimeout, setSessionTimeout] = useState<number>(30);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Use Focus Trap
  const modalRef = useFocusTrap(isOpen, onClose);

  // Load settings on mount
  useEffect(() => {
    if (isOpen) {
      setSessionTimeout(timeoutDuration);
      setSaved(false);
    }
  }, [isOpen, timeoutDuration]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await updateTimeoutSettings(sessionTimeout);
      setSaved(true);

      // Close after 1 second
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('[Preferences] Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'
      role="dialog"
      aria-modal="true"
      aria-labelledby="preferences-modal-title"
    >
      <div
        ref={modalRef}
        className='bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative'
      >
        <button
          type='button'
          onClick={onClose}
          className='absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition focus-ring'
          aria-label="Close preferences"
        >
          <span className='material-icons'>close</span>
        </button>

        <h2
          id="preferences-modal-title"
          className='text-xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2'
        >
          <span className='material-icons text-sky-500'>tune</span>
          Preferences
        </h2>

        <div className='space-y-6'>
          {/* User Info */}
          <div className='p-4 bg-gradient-to-br from-sky-500/10 to-teal-600/10 border border-white/5 rounded-xl'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-teal-600 flex items-center justify-center'>
                <span className='material-icons text-2xl text-white'>account_circle</span>
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-bold text-white truncate'>
                  {user?.full_name ||
                    user?.username ||
                    (user?.email || authUser?.email)?.split('@')[0] ||
                    'User'}
                </p>
                <p className='text-xs text-zinc-400 truncate'>
                  {user?.email || authUser?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Session Timeout */}
          <div>
            <label
              htmlFor='session-timeout-select'
              className='block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2'
            >
              Session Idle Timeout
            </label>
            <select
              id='session-timeout-select'
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(Number(e.target.value))}
              className='w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium focus:outline-none focus:border-sky-500/50 transition appearance-none'
            >
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes (Default)</option>
              <option value={60}>1 Hour</option>
              <option value={120}>2 Hours</option>
              <option value={0}>Disabled</option>
            </select>
            <p className='text-[10px] text-zinc-600 mt-2'>
              Automatically logout after inactivity to protect your account.
            </p>
          </div>

          {/* Divider */}
          <div className='border-t border-white/10' />

          {/* Info Note */}
          <div className='p-3 bg-zinc-800/50 border border-white/5 rounded-lg'>
            <p className='text-xs text-zinc-400 flex items-start gap-2'>
              <span className='material-icons text-sm text-sky-500 mt-0.5'>info</span>
              <span>
                AI model settings and API configurations are managed by your administrator.
              </span>
            </p>
          </div>

          {/* Save Button */}
          <button
            type='button'
            onClick={handleSave}
            disabled={isSaving}
            className='w-full h-12 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-teal-600 hover:from-sky-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'
          >
            {isSaving ? (
              <>
                <span className='material-icons animate-spin text-sm'>sync</span>
                Saving...
              </>
            ) : saved ? (
              <>
                <span className='material-icons text-white text-sm'>check_circle</span>
                Saved!
              </>
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPreferencesModal;
