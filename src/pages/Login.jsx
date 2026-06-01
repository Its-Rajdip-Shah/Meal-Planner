import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';
import { supabase } from '../lib/supabaseClient.js';
import logoUrl from '../../Assets/logo.jpg';

export default function Login() {
  const { user, loading, isConfigured } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const redirectTo = location.state?.from?.pathname ?? '/planner';

  if (loading) {
    return (
      <section className="glass-panel mx-auto w-full max-w-md p-5">
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-emerald-300/70" />
        </div>
        <p className="mt-4 text-sm text-slate-300">Checking session...</p>
      </section>
    );
  }

  if (user) {
    return <Navigate replace to={redirectTo} />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!supabase) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.');
      return;
    }

    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    navigate(redirectTo, { replace: true });
  }

  return (
    <section className="glass-panel mx-auto w-full max-w-md overflow-hidden">
      <div className="border-b border-white/10 bg-white/[0.04] p-5">
        <div className="flex items-center gap-3">
          <img
            alt="Biweekly Meal Planner logo"
            className="h-14 w-14 rounded-lg border border-white/10 object-cover"
            src={logoUrl}
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
              Private access
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-white">Sign in</h2>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          Use the email and password created in Supabase Auth.
        </p>
      </div>

      {!isConfigured && (
        <div className="mx-5 mt-5 rounded-md border border-amber-300/30 bg-amber-400/10 p-3 text-sm text-amber-100">
          Supabase environment variables are missing.
        </div>
      )}

      <form className="grid gap-4 p-5" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm">
          <span className="text-slate-200">Email</span>
          <input
            className="min-h-11 rounded-md border border-white/10 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none ring-emerald-300/40 transition placeholder:text-slate-600 focus:ring-2"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="text-slate-200">Password</span>
          <input
            className="min-h-11 rounded-md border border-white/10 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none ring-emerald-300/40 transition focus:ring-2"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        {error && (
          <div className="rounded-md border border-red-300/30 bg-red-400/10 p-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <button
          className="primary-button w-full"
          disabled={submitting || !isConfigured}
          type="submit"
        >
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </section>
  );
}
