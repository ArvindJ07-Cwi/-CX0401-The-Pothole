import { Eye, EyeOff, AlertCircle, Loader2, User, HardHat } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { UserRole, GeographicArea } from '../../types';
import { useAuth } from '../../context/AuthContext';
import LocationSelector from '../../components/ui/LocationSelector';
import { SadakSetuMark } from '../../components/auth/SadakSetuLogo';
import AuthProductPanel from '../../components/auth/AuthProductPanel';
import axios from 'axios';

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [areas, setAreas] = useState<GeographicArea[]>([]);
  const [selectedAreaIds, setSelectedAreaIds] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    selectedRole: 'citizen' as UserRole,
  });

  useEffect(() => {
    axios
      .get('http://localhost:8000/api/geo/areas')
      .then((res) => setAreas(res.data))
      .catch((err) => console.error('Failed to load geo areas', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (formData.selectedRole === 'authority') {
      setError('Municipal Authority registration is restricted. Please contact your administrator.');
      return;
    }
    if (formData.selectedRole === 'contractor' && selectedAreaIds.length === 0) {
      setError('Contractors must select at least one service area.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Register
      const registerRes = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.selectedRole,
          service_area_ids: formData.selectedRole === 'contractor' ? selectedAreaIds : undefined,
        }),
      });
      if (!registerRes.ok) {
        const errData = await registerRes.json();
        throw new Error(errData.detail || 'Registration failed');
      }

      // 2. Auto-login
      const tokenRes = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: formData.email, password: formData.password }),
      });
      if (!tokenRes.ok) throw new Error('Auto-login failed. Please sign in manually.');
      const tokenData = await tokenRes.json();

      // 3. User profile
      const userRes = await fetch('http://localhost:8000/api/auth/me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (!userRes.ok) throw new Error('Failed to fetch user profile');
      const userData = await userRes.json();

      // 4. Auth context
      login(tokenData.access_token, userData);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full overflow-x-hidden">

      {/* ── LEFT: Auth panel ────────────────────────────────────────────── */}
      <div className="w-full md:w-[360px] lg:w-[400px] xl:w-[420px] shrink-0 flex flex-col bg-white border-r border-slate-100 px-8 py-10 lg:px-10 overflow-y-auto">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
              <SadakSetuMark size={34} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 text-center">Create an account</h1>
            <p className="text-sm text-slate-500 text-center">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign in instead
              </Link>
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-6">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

            {/* Error banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl flex items-start gap-2">
                <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Full name */}
            <div>
              <label htmlFor="signup-name" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Full name
              </label>
              <input
                id="signup-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Email address
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
              />
            </div>

            {/* Password + confirm */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="signup-password" className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="signup-confirm" className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Confirm
                </label>
                <input
                  id="signup-confirm"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">I am a…</label>
              <div className="grid grid-cols-2 gap-2.5">
                {([
                  { value: 'citizen' as UserRole,    label: 'Citizen',    icon: <User size={15} /> },
                  { value: 'contractor' as UserRole, label: 'Contractor', icon: <HardHat size={15} /> },
                ]).map(({ value, label, icon }) => (
                  <label
                    key={value}
                    className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 cursor-pointer transition-colors ${
                      formData.selectedRole === value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={value}
                      checked={formData.selectedRole === value}
                      onChange={() => {
                        setFormData({ ...formData, selectedRole: value });
                        setSelectedAreaIds([]);
                      }}
                      className="sr-only"
                    />
                    <span className={formData.selectedRole === value ? 'text-blue-600' : 'text-slate-400'}>
                      {icon}
                    </span>
                    <span className="text-sm font-medium">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Service areas (contractor only) */}
            {formData.selectedRole === 'contractor' && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <p className="text-xs font-semibold text-slate-600 mb-0.5">
                  Service Areas <span className="text-red-500">*</span>
                </p>
                <p className="text-[11px] text-slate-400 mb-3">
                  Select the localities, cities, or regions where you operate.
                </p>
                <LocationSelector
                  areas={areas}
                  selectedIds={selectedAreaIds}
                  onChange={setSelectedAreaIds}
                  multiSelect={true}
                />
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="mt-auto pt-8 text-center text-[11px] text-slate-400">
          SadakSetu Pothole Management System
        </p>
      </div>

      {/* ── RIGHT: Product panel (hidden on mobile) ─────────────────────── */}
      <div className="hidden md:flex flex-1 min-w-0">
        <AuthProductPanel />
      </div>
    </div>
  );
}
