import React from 'react';
import { useCanvas } from '@/context/CanvasContext';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface SnapshotsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SnapshotsModal: React.FC<SnapshotsModalProps> = ({ isOpen, onClose }) => {
  const { snapshots, restoreSnapshot, deleteSnapshot } = useCanvas();
  const modalRef = useFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'
      role='dialog'
      aria-modal='true'
      aria-labelledby='snapshots-modal-title'
    >
      <div
        ref={modalRef}
        className='bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto relative shadow-2xl'
      >
        {/* Header */}
        <div className='flex justify-between items-center mb-6'>
          <h2
            id='snapshots-modal-title'
            className='text-xl font-bold text-white flex items-center gap-2'
          >
            <span className='material-icons text-purple-500'>history</span>
            Saved Snapshots
          </h2>
          <button
            type='button'
            onClick={onClose}
            className='min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition focus-ring'
            aria-label='Close modal'
          >
            <span className='material-icons'>close</span>
          </button>
        </div>

        {/* List */}
        <div className='space-y-3'>
          {snapshots.length === 0 ? (
            <div className='text-center py-8 text-zinc-500'>
              <span className='material-icons text-4xl mb-2 opacity-50'>save_as</span>
              <p>No saved snapshots yet.</p>
              <p className='text-xs mt-1'>Save your current design to see it here.</p>
            </div>
          ) : (
            snapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                className='p-4 bg-zinc-950 border border-white/5 rounded-xl flex justify-between items-center group hover:border-purple-500/30 transition'
              >
                <div className='overflow-hidden mr-4'>
                  <h3 className='text-white font-medium truncate' title={snapshot.name}>
                    {snapshot.name}
                  </h3>
                  <p className='text-xs text-zinc-500'>
                    {new Date(snapshot.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className='flex gap-1 shrink-0'>
                  <button
                    type='button'
                    onClick={() => {
                      restoreSnapshot(snapshot);
                      onClose();
                    }}
                    className='p-2 hover:bg-white/10 rounded-lg text-purple-400 hover:text-purple-300 transition'
                    title='Restore'
                    aria-label={`Restore ${snapshot.name}`}
                  >
                    <span className='material-icons'>restore</span>
                  </button>
                  <button
                    type='button'
                    onClick={() => deleteSnapshot(snapshot.id)}
                    className='p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-red-400 transition'
                    title='Delete'
                    aria-label={`Delete ${snapshot.name}`}
                  >
                    <span className='material-icons'>delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
