import React, { useState, useCallback } from 'react';
import { signUp, resetPassword } from '../../services/auth';
import { validateUsernameFormat, checkUsernameAvailability } from '../../services/auth';
import { debounce } from '../../utils/debounce';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { signIn: contextSignIn } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // NEW FIELDS
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  // Validation states
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Debounced username availability check
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkUsername = useCallback(
    debounce(async (value: string) => {
      if (!value || value.length < 3) return;

      setUsernameChecking(true);
      setUsernameError(null);

      try {
        // Format validation
        const validation = validateUsernameFormat(value);
        if (!validation.isValid) {
          setUsernameError(validation.error || 'Invalid username');
          setUsernameChecking(false);
          return;
        }

        // Availability check
        const isAvailable = await checkUsernameAvailability(value);
        if (!isAvailable) {
          setUsernameError('Username already taken');
        }
      } catch (err) {
        console.error('Username check error:', err);
        setUsernameError('Could not verify username');
      } finally {
        setUsernameChecking(false);
      }
    }, 500),
    [],
  );

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    if (value.length >= 3) {
      checkUsername(value);
    } else {
      setUsernameError(null);
      setUsernameChecking(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setUsername('');
    setUsernameError(null);
    setUsernameChecking(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'reset') {
        // Password reset flow
        const result = await resetPassword(email);
        if (result.error) {
          setError(result.error.message);
          return;
        }

        setSuccessMessage('Password reset email sent! Check your inbox.');
        setTimeout(() => {
          setMode('signin');
          setSuccessMessage(null);
          setEmail('');
        }, 3000);
      } else if (mode === 'signin') {
        const { error: signInError } = await contextSignIn(email, password);
        if (signInError) {
          setError(signInError.message);
          return;
        }

        // Success!
        onSuccess();
        onClose();
        resetForm();
      } else {
        // Sign up mode
        if (usernameError) {
          setError('Please fix the username error before continuing');
          return;
        }

        if (!username) {
          setError('Username is required');
          return;
        }

        const { error: signUpError } = await signUp(email, password, {
          first_name: firstName,
          last_name: lastName,
          username: username,
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        // Success!
        onSuccess();
        onClose();
        resetForm();
      }
    } catch (err: unknown) {
      console.error('[AuthModal] Error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'>
      <div className='bg-zinc-900 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto'>
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-zinc-500 hover:text-white transition'
        >
          <span className='material-icons'>close</span>
        </button>

        <div className='text-center mb-8'>
          <h2 className='text-2xl font-black text-white uppercase tracking-wider mb-2'>
            {mode === 'signin'
              ? 'Welcome Back'
              : mode === 'signup'
                ? 'Create Account'
                : 'Reset Password'}
          </h2>
          <p className='text-sm text-zinc-500'>
            {mode === 'signin'
              ? 'Sign in to access your designs'
              : mode === 'signup'
                ? 'Sign up to save your creations'
                : "We'll send you a reset link"}
          </p>
        </div>

        {/* Toggle between Sign In and Sign Up (not shown in reset mode) */}
        {mode !== 'reset' && (
          <div className='flex bg-zinc-950 p-1 rounded-xl border border-white/5 mb-6'>
            <button
              onClick={() => {
                setMode('signin');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                mode === 'signin'
                  ? 'bg-zinc-800 text-white shadow-md'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                mode === 'signup'
                  ? 'bg-zinc-800 text-white shadow-md'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Back button for reset mode */}
        {mode === 'reset' && (
          <button
            onClick={() => {
              setMode('signin');
              setError(null);
              setSuccessMessage(null);
            }}
            className='flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 mb-6 transition'
          >
            <span className='material-icons text-sm'>arrow_back</span>
            Back to Sign In
          </button>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Sign Up Only: First Name, Last Name, Username */}
          {mode === 'signup' && (
            <>
              <div>
                <label className='block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2'>
                  First Name
                </label>
                <input
                  type='text'
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder='John'
                  required
                  className='w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50 transition placeholder-zinc-700'
                />
              </div>

              <div>
                <label className='block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2'>
                  Last Name
                </label>
                <input
                  type='text'
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder='Doe'
                  required
                  className='w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50 transition placeholder-zinc-700'
                />
              </div>

              <div>
                <label className='block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2'>
                  Username
                </label>
                <div className='relative'>
                  <span className='absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm'>
                    @
                  </span>
                  <input
                    type='text'
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder='username'
                    required
                    minLength={3}
                    maxLength={30}
                    className='w-full bg-zinc-950 border border-white/10 rounded-xl pl-8 pr-12 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50 transition placeholder-zinc-700'
                  />
                  {/* Loading spinner */}
                  {usernameChecking && (
                    <span className='absolute right-4 top-1/2 -translate-y-1/2 material-icons text-zinc-500 text-sm animate-spin'>
                      refresh
                    </span>
                  )}
                  {/* Success checkmark */}
                  {!usernameChecking && username.length >= 3 && !usernameError && (
                    <span className='absolute right-4 top-1/2 -translate-y-1/2 material-icons text-green-500 text-sm'>
                      check_circle
                    </span>
                  )}
                  {/* Error icon */}
                  {!usernameChecking && usernameError && (
                    <span className='absolute right-4 top-1/2 -translate-y-1/2 material-icons text-red-500 text-sm'>
                      error
                    </span>
                  )}
                </div>
                {usernameError && (
                  <p className='text-[9px] text-red-400 mt-2 flex items-center gap-1'>
                    <span className='material-icons text-[10px]'>error</span>
                    {usernameError}
                  </p>
                )}
                <p className='text-[9px] text-zinc-600 mt-2'>
                  3-30 characters. Letters, numbers, underscores, hyphens only.
                </p>
              </div>
            </>
          )}

          {/* All Modes: Email */}
          <div>
            <label className='block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2'>
              Email
            </label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='you@example.com'
              required
              className='w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50 transition placeholder-zinc-700'
            />
          </div>

          {/* Sign In & Sign Up: Password */}
          {mode !== 'reset' && (
            <div>
              <label className='block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2'>
                Password
              </label>
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='••••••••'
                required
                minLength={6}
                className='w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50 transition placeholder-zinc-700'
              />
              {mode === 'signup' && (
                <p className='text-[9px] text-zinc-600 mt-2'>Minimum 6 characters</p>
              )}
              {mode === 'signin' && (
                <button
                  type='button'
                  onClick={() => {
                    setMode('reset');
                    setError(null);
                  }}
                  className='text-[9px] text-purple-400 hover:text-purple-300 mt-2 transition'
                >
                  Forgot Password?
                </button>
              )}
            </div>
          )}

          {/* Password Reset Mode: Info */}
          {mode === 'reset' && (
            <div className='bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-start gap-2'>
              <span className='material-icons text-blue-400 text-sm mt-0.5'>info</span>
              <p className='text-xs text-blue-300 flex-1'>
                Enter your email address and we'll send you instructions to reset your password.
              </p>
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div className='bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-start gap-2'>
              <span className='material-icons text-green-500 text-sm mt-0.5'>check_circle</span>
              <p className='text-xs text-green-400 flex-1'>{successMessage}</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className='bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2'>
              <span className='material-icons text-red-500 text-sm mt-0.5'>error</span>
              <p className='text-xs text-red-400 flex-1'>{error}</p>
            </div>
          )}

          <button
            type='submit'
            disabled={loading || (mode === 'signup' && (usernameChecking || !!usernameError))}
            className='w-full h-12 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? (
              <>
                <span className='material-icons animate-spin'>refresh</span>
                Processing...
              </>
            ) : mode === 'signin' ? (
              <>
                <span className='material-icons'>login</span>
                Sign In
              </>
            ) : mode === 'signup' ? (
              <>
                <span className='material-icons'>person_add</span>
                Create Account
              </>
            ) : (
              <>
                <span className='material-icons'>email</span>
                Send Reset Link
              </>
            )}
          </button>
        </form>

        {/* Toggle link at bottom */}
        {mode !== 'reset' && (
          <div className='mt-6 text-center'>
            <p className='text-xs text-zinc-600'>
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className='text-purple-400 hover:text-purple-300 font-bold'
              >
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        )}

        {mode === 'signup' && (
          <div className='mt-4 text-center'>
            <p className='text-[9px] text-zinc-600'>
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
