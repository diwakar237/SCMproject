import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const sessionExpired = queryParams.get('sessionExpired') === 'true';
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await login(email, password);
      // Route appropriately based on destination or role
      if (from) {
        navigate(from, { replace: true });
      } else if (res.role === 'VENUE_OWNER') {
        navigate('/owner-dashboard', { replace: true });
      } else {
        navigate('/my-bookings', { replace: true });
      }
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login failed. Please check your credentials.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex justify-center">
            <span className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-blue-500/20">
              S
            </span>
          </div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Or{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 underline">
              register a new account
            </Link>
          </p>
        </div>

        {sessionExpired && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3.5 rounded-lg">
            Your session has expired. Please sign in again.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3.5 rounded-lg flex items-start gap-2">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Quick-fill demo account switcher */}
        <div className="pt-4 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
            Quick Fill Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('customer@demo.com', 'Password123!')}
              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded text-left transition font-medium text-slate-700"
            >
              👤 Customer
              <span className="block text-[10px] text-slate-400 font-normal truncate">customer@demo.com</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('owner@demo.com', 'Password123!')}
              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded text-left transition font-medium text-slate-700"
            >
              🏢 Venue Owner
              <span className="block text-[10px] text-slate-400 font-normal truncate">owner@demo.com</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('vendor@demo.com', 'Password123!')}
              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded text-left transition font-medium text-slate-700"
            >
              🛠️ Vendor
              <span className="block text-[10px] text-slate-400 font-normal truncate">vendor@demo.com</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('organizer@demo.com', 'Password123!')}
              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded text-left transition font-medium text-slate-700"
            >
              📋 Organizer
              <span className="block text-[10px] text-slate-400 font-normal truncate">organizer@demo.com</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@demo.com', 'AdminPass123!')}
              className="col-span-2 p-2 border border-purple-200 bg-purple-50/50 hover:bg-purple-100/50 rounded text-left transition font-medium text-purple-900"
            >
              ⚡ System Administrator
              <span className="block text-[10px] text-purple-500 font-normal truncate">admin@demo.com (AdminPass123!)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
