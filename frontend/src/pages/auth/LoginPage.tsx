import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SadakSetuMark } from '../../components/auth/SadakSetuLogo';
import AuthProductPanel from '../../components/auth/AuthProductPanel';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Get token
      const tokenRes = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: formData.email, password: formData.password }),
      });
      if (!tokenRes.ok) {
        const err = await tokenRes.json();
        throw new Error(err.detail || 'Login failed');
      }
      const tokenData = await tokenRes.json();

      // 2. Get user profile
      const userRes = await fetch('http://localhost:8000/api/auth/me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (!userRes.ok) throw new Error('Failed to fetch user profile');
      const userData = await userRes.json();

      // 3. Update auth context
      login(tokenData.access_token, userData);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full overflow-x-hidden">

      {/* ── LEFT: Auth panel ────────────────────────────────────────────── */}
      <div className="w-full md:w-[340px] lg:w-[380px] xl:w-[400px] shrink-0 flex flex-col bg-white border-r border-slate-100 px-8 py-12 lg:px-10 overflow-y-auto">

        {/* Logo */}
        <div className="flex justify-center mb-7">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
              <SadakSetuMark size={34} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 text-center leading-tight">
              Sign in to SadakSetu
            </h1>
            <p className="text-sm text-slate-500 text-center">
              Or{' '}
              <Link
                to="/signup"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                create a new account
              </Link>
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-7">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>

            {/* Error banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl flex items-start gap-2">
                <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me (no fake "Forgot password" — not implemented) */}
            <div className="flex items-center gap-2.5">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="remember-me" className="text-sm text-slate-600 cursor-pointer select-none">
                Remember me
              </label>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="mt-auto pt-8 text-center text-[11px] text-slate-400 leading-relaxed">
          SadakSetu Pothole Management System<br />
          <span className="text-slate-300">—</span>
        </p>
      </div>

      {/* ── RIGHT: Product panel (hidden on mobile) ─────────────────────── */}
      <div className="hidden md:flex flex-1 min-w-0">
        <AuthProductPanel />
      </div>
    </div>
  );
}
