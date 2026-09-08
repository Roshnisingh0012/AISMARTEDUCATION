import { useState, type FormEvent } from 'react';
import {
  ShieldCheck, GraduationCap, BarChart3, Loader2,
  Building2, Lock, Mail, CheckCircle2, UserCog, UserPlus,
  Eye, EyeOff, ArrowLeft,
} from 'lucide-react';
import { useAuth, defaultJobRoleFor } from '@/lib/auth';
import type { AppRole, AuthUser, JobRole } from '@/lib/types';
import { ALL_ROLES, ROLE_META, STATISTICAL_ROLES, TECH_ROLES } from '@/lib/domains';

const DEPARTMENTS = [
  'MoSPI', 'Directorate of Economics & Statistics', 'NITI Aayog',
  'RBI', 'NIC', 'CDAC', 'Registrar General', 'Other',
];

type Mode = 'signin' | 'register' | 'forgot';

export default function LoginView() {
  const { login, saveProfile } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [appRole, setAppRole] = useState<AppRole>('learner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [jobRole, setJobRole] = useState<JobRole>('SSO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  function switchMode(m: Mode) {
    setMode(m);
    setError(null);
    setResetSent(false);
  }

  function selectRole(r: AppRole) {
    setAppRole(r);
    setJobRole(defaultJobRoleFor(r));
  }

  // ---- Sign In ----
  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email.trim().toLowerCase());
      formData.append('password', password);

      const baseUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : '/api/v1';
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (!res.ok) {
        throw new Error('Incorrect email or password');
      }
      
      const data = await res.json();
      localStorage.setItem('token', data.access_token);

      const profileRes = await fetch(`${baseUrl}/auth/me`, {
        headers: { 'Authorization': 'Bearer ' + data.access_token }
      });
      if (!profileRes.ok) throw new Error('Profile not found.');
      
      const profile = await profileRes.json();
      login({
        name: profile.full_name || profile.email,
        email: profile.email,
        appRole: profile.role.toLowerCase() as AppRole,
        jobRole: profile.designation as JobRole || 'SSO',
        department: profile.department || 'MoSPI'
      });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  // ---- Register ----
  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !name.trim()) {
      setError('Please fill in your name, email, and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const baseUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : '/api/v1';
      const registerRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          full_name: name.trim(),
          role: appRole,
          department,
          designation: jobRole
        })
      });

      if (!registerRes.ok) {
        const errData = await registerRes.json().catch(() => ({}));
        throw new Error(errData.detail || 'Registration failed');
      }

      const data = await registerRes.json();
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
      }

      const user: AuthUser = {
        name: data.full_name || name.trim(),
        email: data.email || email.trim().toLowerCase(),
        appRole: (data.role || appRole).toLowerCase() as AppRole,
        jobRole: (data.designation || jobRole) as JobRole,
        department: data.department || department,
      };

      login(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // ---- Forgot Password ----
  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setResetSent(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: dark branding banner (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-gradient-to-br from-brand-700 via-brand-800 to-ink-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div className="relative flex flex-col justify-between p-12 xl:p-16 text-white">
          <div className="animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold">StatCompetency AI</h1>
            </div>
            <p className="mt-4 text-sm text-brand-100 max-w-sm leading-relaxed">
              AI Skill Intelligence &amp; Competency Platform for Official
              Statistics.
            </p>
          </div>

          <div className="space-y-6 animate-fadeIn" style={{ animationDelay: '120ms' }}>
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Personalised Learning Pathways</h3>
                <p className="mt-1 text-xs text-brand-100 leading-relaxed">
                  AI-driven course recommendations based on your competency gaps
                  and role requirements.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Competency Assessments</h3>
                <p className="mt-1 text-xs text-brand-100 leading-relaxed">
                  Self-assessment across four domains with visual gap analysis
                  and progress tracking.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Integrated with iGOT Karmayogi</h3>
                <p className="mt-1 text-xs text-brand-100 leading-relaxed">
                  Courses from iGOT Karmayogi &amp; NSSTA, aligned with
                  {ALL_ROLES.length} statistical and technical roles.
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-brand-200 animate-fadeIn" style={{ animationDelay: '240ms' }}>
            Secured by StatCompetency Enterprise Auth · Integrated with iGOT Karmayogi &amp; NSSTA
          </p>
        </div>
      </div>

      {/* Right: auth form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10 bg-ink-50">
        <div className="w-full max-w-md animate-fadeIn">
          {/* Mobile gradient header card */}
          <div className="lg:hidden mb-6">
            <div className="rounded-2xl bg-gradient-to-br from-brand-700 via-brand-800 to-ink-900 p-6 text-center text-white shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle at 30% 70%, white 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }} />
              <div className="relative">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20">
                  <ShieldCheck className="h-8 w-8 text-white" />
                </div>
                <h1 className="mt-3 text-xl font-bold">StatCompetency AI</h1>
                <p className="mt-1 text-xs text-brand-100">
                  AI Skill Intelligence &amp; Competency Platform
                </p>
              </div>
            </div>
          </div>

          {/* Forgot password view */}
          {mode === 'forgot' ? (
            <div className="rounded-2xl bg-white shadow-card p-7">
              <button
                onClick={() => switchMode('signin')}
                className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-brand-600"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
              </button>
              <h2 className="text-lg font-bold text-ink-900">Reset your password</h2>
              <p className="mt-1 text-sm text-ink-500">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>
              {resetSent ? (
                <div className="mt-6 flex items-start gap-3 rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Check your email</p>
                    <p className="mt-1 text-xs text-emerald-600">
                      A password reset link has been sent to {email}. Follow the link to set a new password, then come back to sign in.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="mt-6 space-y-4">
                  <div>
                    <label className="gov-label">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                      <input
                        type="email"
                        className="gov-input pl-9"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        autoFocus
                      />
                    </div>
                  </div>
                  {error && <p className="text-xs text-rose-600">{error}</p>}
                  <button type="submit" disabled={loading} className="gov-btn-primary w-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    {loading ? 'Sending…' : 'Send reset link'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Tab toggle */}
              <div className="flex rounded-lg bg-ink-100 p-1 mb-6">
                <button
                  onClick={() => switchMode('signin')}
                  className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${
                    mode === 'signin' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => switchMode('register')}
                  className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${
                    mode === 'register' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                  }`}
                >
                  Register
                </button>
              </div>

              <h2 className="text-lg font-bold text-ink-900">
                {mode === 'signin' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                {mode === 'signin'
                  ? 'Sign in with your registered email and password.'
                  : 'Register with your email and password.'}
              </p>

              {/* Sign In form */}
              {mode === 'signin' ? (
                <form onSubmit={handleSignIn} className="mt-6 space-y-4">
                  <div>
                    <label className="gov-label">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                      <input
                        type="email"
                        className="gov-input pl-9"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div>
                    <label className="gov-label">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="gov-input pl-9 pr-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {error && <p className="text-xs text-rose-600">{error}</p>}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <button type="submit" disabled={loading} className="gov-btn-primary w-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {loading ? 'Signing in…' : 'Sign in'}
                  </button>
                </form>
              ) : (
                /* Register form */
                <form onSubmit={handleRegister} className="mt-6 space-y-4">
                  <div>
                    <label className="gov-label">Full name</label>
                    <div className="relative">
                      <UserCog className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                      <input
                        className="gov-input pl-9"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div>
                    <label className="gov-label">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                      <input
                        type="email"
                        className="gov-input pl-9"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="gov-label">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="gov-input pl-9 pr-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="gov-label flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" /> Department
                    </label>
                    <select
                      className="gov-input"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="gov-label">Job role</label>
                    <select
                      className="gov-input"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value as JobRole)}
                    >
                      <optgroup label="Statistical Officers">
                        {STATISTICAL_ROLES.map((r) => (
                          <option key={r} value={r}>{ROLE_META[r].label}</option>
                        ))}
                      </optgroup>
                      <optgroup label="IT / Engineering Roles">
                        {TECH_ROLES.map((r) => (
                          <option key={r} value={r}>{ROLE_META[r].label}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  {error && <p className="text-xs text-rose-600">{error}</p>}
                  <button type="submit" disabled={loading} className="gov-btn-primary w-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                    {loading ? 'Creating account…' : 'Create account & sign in'}
                  </button>
                </form>
              )}

              <p className="mt-6 text-center text-xs text-ink-400">
                {mode === 'signin' ? (
                  <>Don&apos;t have an account?{' '}
                    <button onClick={() => switchMode('register')} className="font-semibold text-brand-600 hover:text-brand-700">
                      Register here
                    </button>
                  </>
                ) : (
                  <>Already have an account?{' '}
                    <button onClick={() => switchMode('signin')} className="font-semibold text-brand-600 hover:text-brand-700">
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
