import React, { useState } from 'react';
import { supabase } from '../supabase/client';
import { SpinnerIcon } from './icons';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuthAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
        if (isLogin) {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            // The onAuthStateChange listener in App.tsx will handle the redirect.
        } else {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            setMessage('Check your email for the confirmation link!');
        }
    } catch (err: any) {
      setError(err.error_description || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 font-sans">
      <div className="w-full max-w-sm p-8 space-y-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
        <h1 className="text-3xl font-bold text-center text-white">CodeTree Notes</h1>
        <p className="text-center text-slate-400">
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </p>

        <form className="space-y-6" onSubmit={handleAuthAction}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-400">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-400">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-800 disabled:bg-slate-600"
            >
              {loading ? <SpinnerIcon /> : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </form>

        {error && (
            <div className="bg-red-900/50 border border-red-500/30 text-red-300 px-4 py-3 rounded-md text-sm">
                {error}
            </div>
        )}
        {message && (
            <div className="bg-green-900/50 border border-green-500/30 text-green-300 px-4 py-3 rounded-md text-sm">
                {message}
            </div>
        )}


        <p className="text-center text-sm text-slate-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null); }} className="font-medium text-cyan-400 hover:text-cyan-300">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};
