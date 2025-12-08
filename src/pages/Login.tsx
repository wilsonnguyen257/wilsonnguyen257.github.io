import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, signInWithEmailAndPassword, onAuthStateChanged, logout, IS_FIREBASE_CONFIGURED, type User } from '../lib/firebase';
import { logAuditAction } from '../lib/audit';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Get the page user was trying to access, default to /admin
  const from = (location.state as { from?: string })?.from || '/admin';

  // Check if user is already logged in
  useEffect(() => {
    if (!IS_FIREBASE_CONFIGURED) {
      setCheckingAuth(false);
      return;
    }

    const unsubscribe = onAuthStateChanged((user) => {
      setCurrentUser(user);
      setCheckingAuth(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!IS_FIREBASE_CONFIGURED) {
      setError('Firebase is not configured. Please check your environment variables.');
      setLoading(false);
      return;
    }

    try {
      if (!auth) {
        throw new Error('Firebase auth not initialized');
      }
      
      await signInWithEmailAndPassword(auth, email, password);
      
      // Log successful login
      await logAuditAction('auth.login', {
        email,
        timestamp: new Date().toISOString()
      });

      // Redirect to the page user was trying to access
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = 'Failed to sign in. Please check your credentials.';
      
      if (err && typeof err === 'object' && 'code' in err) {
        const firebaseError = err as { code: string };
        switch (firebaseError.code) {
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address format.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password.';
            break;
          case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later.';
            break;
          default:
            errorMessage = `Login failed: ${firebaseError.code}`;
        }
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (!IS_FIREBASE_CONFIGURED) {
    return (
      <div className="container-xl py-12">
        <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-800">Firebase Not Configured</h1>
          <p className="text-red-700">
            Firebase authentication is not configured. Please set up your environment variables.
          </p>
        </div>
      </div>
    );
  }

  if (checkingAuth) {
    return (
      <div className="container-xl py-12 text-center text-slate-500">
        Checking authentication...
      </div>
    );
  }

  // If already logged in, show logged in state
  if (currentUser) {
    return (
      <div className="container-xl py-12">
        <div className="mx-auto max-w-md">
          <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">Already Logged In</h1>
              <p className="text-slate-600">
                You're signed in as <strong>{currentUser.email}</strong>
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin')}
                className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Go to Admin Dashboard
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full rounded-md bg-slate-100 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-xl py-12">
      <div className="mx-auto max-w-md">
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-center text-2xl font-bold text-slate-800">Admin Login</h1>
          
          {error && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-md border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@example.com"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-md border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            <p>Authorized personnel only</p>
          </div>
        </div>
      </div>
    </div>
  );
}
