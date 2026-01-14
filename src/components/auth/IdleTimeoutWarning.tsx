import React, { useEffect, useState } from 'react';

interface IdleTimeoutWarningProps {
  isOpen: boolean;
  onStayLoggedIn: () => void;
  remainingTime?: number; // Optional: show countdown
}

export const IdleTimeoutWarning: React.FC<IdleTimeoutWarningProps> = ({
  isOpen,
  onStayLoggedIn,
  remainingTime = 120, // Default 2 minutes
}) => {
  const [countdown, setCountdown] = useState(remainingTime);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCountdown(remainingTime);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, remainingTime]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200'
      role='alertdialog'
      aria-modal='true'
      aria-labelledby='timeout-title'
      aria-describedby='timeout-desc'
    >
      <div className='bg-zinc-900 border border-red-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden'>
        {/* Progress Bar Background */}
        <div
          className='absolute bottom-0 left-0 h-1 bg-red-500/50 transition-all duration-1000 ease-linear'
          style={{ width: `${(countdown / remainingTime) * 100}%` }}
        />

        <div className='flex flex-col items-center text-center space-y-4 relative z-10'>
          <div className='w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-2'>
            <span className='material-icons text-red-500 text-2xl'>timer</span>
          </div>

          <h2 id='timeout-title' className='text-xl font-bold text-white'>
            Session Expiring
          </h2>

          <p id='timeout-desc' className='text-zinc-400 text-sm'>
            You will be logged out in{' '}
            <span className='text-white font-mono font-bold'>{formatTime(countdown)}</span> due to
            inactivity.
          </p>

          <button
            onClick={onStayLoggedIn}
            className='w-full py-3 px-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition active:scale-[0.98] mt-2'
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
};
