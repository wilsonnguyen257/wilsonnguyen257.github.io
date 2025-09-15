import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, IS_FIREBASE_CONFIGURED } from '../lib/firebase';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from || '/admin';

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await login(email.trim(), password);
    setLoading(false);
    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Login failed');
    }
  };

  return (
    <section className="container-xl py-12">
      <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h1 className="h2 mb-2">Admin Sign In</h1>
        <p className="text-sm text-slate-500 mb-6">
          {IS_FIREBASE_CONFIGURED ? 'Use your Firebase Auth email/password.' : 'Firebase not configured — any credentials will work locally.'}
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              required
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </section>
  );
}
