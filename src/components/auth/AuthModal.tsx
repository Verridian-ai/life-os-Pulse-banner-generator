import React, { useState, useCallback } from 'react';
import { signUp, resetPassword } from '../../services/auth';
import { validateUsernameFormat, checkUsernameAvailability } from '../../services/auth';
import { debounce } from '../../utils/debounce';
import { useAuth } from '../../context/AuthContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';

// OAuth provider icons (inline SVG for reliability)
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#f35325" d="M1 1h10v10H1z" />
    <path fill="#81bc06" d="M13 1h10v10H13z" />
    <path fill="#05a6f0" d="M1 13h10v10H1z" />
    <path fill="#ffba08" d="M13 13h10v10H13z" />
  </svg>
);

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** If true, redirect new signups to onboarding page */
  redirectNewUsersToOnboarding?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, redirectNewUsersToOnboarding = true }) => {
  const {
    signIn: contextSignIn,
    signInWithGoogle,
    signInWithGitHub,
    signInWithMicrosoft,
    sendMagicLink,
    workosStatus,
  } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset' | 'magic'>('signin');
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
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
  const [showPassword, setShowPassword] = useState(false);

  // Use Focus Trap
  const modalRef = useFocusTrap(isOpen, onClose);

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

  // OAuth handlers
  const handleOAuthSignIn = async (provider: 'google' | 'github' | 'microsoft') => {
    setOauthLoading(provider);
    setError(null);

    try {
      let result;
      switch (provider) {
        case 'google':
          result = await signInWithGoogle();
          break;
        case 'github':
          result = await signInWithGitHub();
          break;
        case 'microsoft':
          result = await signInWithMicrosoft();
          break;
      }

      if (result?.error) {
        setError(result.error.message);
      }
      // Note: OAuth redirects to external page, so success handling happens on callback
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OAuth sign-in failed');
    } finally {
      setOauthLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'magic') {
        // Magic link flow
        const result = await sendMagicLink(email);
        if (result.error) {
          setError(result.error.message);
          return;
        }

        setSuccessMessage('Magic link sent! Check your inbox and click the link to sign in.');
        setTimeout(() => {
          setMode('signin');
          setSuccessMessage(null);
          setEmail('');
        }, 5000);
      } else if (mode === 'reset') {
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

        // Success! Redirect new users to onboarding for plan selection
        if (redirectNewUsersToOnboarding) {
          window.location.href = '/onboarding';
          return;
        }

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
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        ref={modalRef}
        className='bg-zinc-900 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto'
      >
        <button
          type="button"
          onClick={onClose}
          className='absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition focus-ring'
          aria-label="Close modal"
        >
          <span className='material-icons'>close</span>
        </button>

        <div className='text-center mb-8'>
          <h2
            id="auth-modal-title"
            className='text-2xl font-black text-white uppercase tracking-wider mb-2'
          >
            {mode === 'signin'
              ? 'Welcome Back'
              : mode === 'signup'
                ? 'Create Account'
                : mode === 'magic'
                  ? 'Magic Link'
                  : 'Reset Password'}
          </h2>
          <p className='text-sm text-zinc-500'>
            {mode === 'signin'
              ? 'Sign in to access your designs'
              : mode === 'signup'
                ? 'Sign up to save your creations'
                : mode === 'magic'
                  ? "We'll email you a sign-in link"
                  : "We'll send you a reset link"}
          </p>
        </div>

        {/* Toggle between Sign In and Sign Up (not shown in reset or magic mode) */}
        {mode !== 'reset' && mode !== 'magic' && (
          <div className='flex bg-zinc-950 p-1 rounded-xl border border-white/5 mb-6'>
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${mode === 'signin'
                ? 'bg-zinc-800 text-white shadow-md'
                : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${mode === 'signup'
                ? 'bg-zinc-800 text-white shadow-md'
                : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Back button for reset or magic mode */}
        {(mode === 'reset' || mode === 'magic') && (
          <button
            type="button"
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

        {/* OAuth Buttons - Show on signin mode when WorkOS is enabled */}
        {mode === 'signin' && workosStatus.enabled && (
          <div className="space-y-3 mb-6">
            {/* OAuth provider buttons */}
            <div className="grid grid-cols-3 gap-3">
              {workosStatus.providers.includes('google') && (
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={!!oauthLoading}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-xl transition disabled:opacity-50"
                  title="Sign in with Google"
                >
                  {oauthLoading === 'google' ? (
                    <span className="material-icons animate-spin text-white">refresh</span>
                  ) : (
                    <GoogleIcon />
                  )}
                </button>
              )}
              {workosStatus.providers.includes('github') && (
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('github')}
                  disabled={!!oauthLoading}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-xl transition disabled:opacity-50 text-white"
                  title="Sign in with GitHub"
                >
                  {oauthLoading === 'github' ? (
                    <span className="material-icons animate-spin">refresh</span>
                  ) : (
                    <GitHubIcon />
                  )}
                </button>
              )}
              {workosStatus.providers.includes('microsoft') && (
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('microsoft')}
                  disabled={!!oauthLoading}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-xl transition disabled:opacity-50"
                  title="Sign in with Microsoft"
                >
                  {oauthLoading === 'microsoft' ? (
                    <span className="material-icons animate-spin text-white">refresh</span>
                  ) : (
                    <MicrosoftIcon />
                  )}
                </button>
              )}
            </div>

            {/* Magic Link button */}
            {workosStatus.magicLinkEnabled && (
              <button
                type="button"
                onClick={() => {
                  setMode('magic');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-xl transition text-sm text-white"
              >
                <span className="material-icons text-lg">magic_button</span>
                Sign in with Magic Link
              </button>
            )}

            {/* Divider */}
            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-zinc-500 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          </div>
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
                  className='w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-500 focus-ring transition placeholder-zinc-700'
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
                  className='w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-500 focus-ring transition placeholder-zinc-700'
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
                    className='w-full bg-zinc-950 border border-white/10 rounded-xl pl-8 pr-12 py-3 text-white text-sm focus:border-purple-500 focus-ring transition placeholder-zinc-700'
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
              className='w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-500 focus-ring transition placeholder-zinc-700'
            />
          </div>

          {/* Sign In & Sign Up: Password (not shown for reset or magic) */}
          {mode !== 'reset' && mode !== 'magic' && (
            <div>
              <label className='block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2'>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='••••••••'
                  required
                  minLength={6}
                  className='w-full bg-zinc-950 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white text-sm focus:border-purple-500 focus-ring transition placeholder-zinc-700'
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-icons text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
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

          {/* Magic Link Mode: Info */}
          {mode === 'magic' && (
            <div className='bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 flex items-start gap-2'>
              <span className='material-icons text-purple-400 text-sm mt-0.5'>auto_awesome</span>
              <p className='text-xs text-purple-300 flex-1'>
                No password needed! We'll send you a secure link to sign in instantly.
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
            ) : mode === 'magic' ? (
              <>
                <span className='material-icons'>auto_awesome</span>
                Send Magic Link
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
        {mode !== 'reset' && mode !== 'magic' && (
          <div className='mt-6 text-center'>
            <p className='text-xs text-zinc-600'>
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
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