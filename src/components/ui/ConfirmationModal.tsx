import React from 'react';


interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false,
}) => {
    if (!isOpen) return null;

    return (
        <div
            className='fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'
            role="dialog"
            aria-modal="true"
        >
            <div className='bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative animate-fadeIn'>
                <button
                    onClick={onClose}
                    className='absolute top-4 right-4 text-zinc-500 hover:text-white transition'
                    aria-label="Close"
                >
                    <span className='material-icons text-sm'>close</span>
                </button>

                <div className='flex flex-col items-center text-center gap-4'>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        <span className='material-icons text-2xl'>
                            {isDestructive ? 'warning' : 'info'}
                        </span>
                    </div>

                    <div>
                        <h3 className='text-lg font-bold text-white mb-2'>{title}</h3>
                        <p className='text-sm text-zinc-400 leading-relaxed'>
                            {message}
                        </p>
                    </div>

                    <div className='flex gap-3 w-full mt-2'>
                        <button
                            onClick={onClose}
                            className='flex-1 py-3 px-4 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition font-bold text-xs uppercase tracking-wider'
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 py-3 px-4 rounded-xl text-white transition font-bold text-xs uppercase tracking-wider shadow-lg ${isDestructive
                                ? 'bg-red-600 hover:bg-red-500'
                                : 'bg-blue-600 hover:bg-blue-500'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
