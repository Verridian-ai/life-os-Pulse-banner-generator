import React, { useState } from 'react';
import { signUp, signIn } from '../../services/supabase';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (mode === 'signin') {
                await signIn({ email, password });
            } else {
                await signUp({ email, password, fullName });
            }

            // Success!
            onSuccess();
            onClose();

            // Reset form
            setEmail('');
            setPassword('');
            setFullName('');
        } catch (err: any) {
            console.error('[AuthModal] Error:', err);
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition"
                >
                    <span className="material-icons">close</span>
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
                        {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-sm text-zinc-500">
                        {mode === 'signin'
                            ? 'Sign in to access your designs'
                            : 'Sign up to save your creations'}
                    </p>
                </div>

                {/* Toggle between Sign In and Sign Up */}
                <div className="flex bg-zinc-950 p-1 rounded-xl border border-white/5 mb-6">
                    <button
                        onClick={() => setMode('signin')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                            mode === 'signin'
                                ? 'bg-zinc-800 text-white shadow-md'
                                : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setMode('signup')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                            mode === 'signup'
                                ? 'bg-zinc-800 text-white shadow-md'
                                : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'signup' && (
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                Full Name (Optional)
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50 transition placeholder-zinc-700"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50 transition placeholder-zinc-700"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50 transition placeholder-zinc-700"
                        />
                        {mode === 'signup' && (
                            <p className="text-[9px] text-zinc-600 mt-2">
                                Minimum 6 characters
                            </p>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2">
                            <span className="material-icons text-red-500 text-sm mt-0.5">error</span>
                            <p className="text-xs text-red-400 flex-1">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <span className="material-icons animate-spin">refresh</span>
                                Processing...
                            </>
                        ) : mode === 'signin' ? (
                            <>
                                <span className="material-icons">login</span>
                                Sign In
                            </>
                        ) : (
                            <>
                                <span className="material-icons">person_add</span>
                                Create Account
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-zinc-600">
                        {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
                        <button
                            onClick={() => {
                                setMode(mode === 'signin' ? 'signup' : 'signin');
                                setError(null);
                            }}
                            className="text-purple-400 hover:text-purple-300 font-bold"
                        >
                            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>

                {mode === 'signup' && (
                    <div className="mt-4 text-center">
                        <p className="text-[9px] text-zinc-600">
                            By signing up, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
