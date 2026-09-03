import React, { FormEvent, useId, useState } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { credentialsAreValid, persistAccess } from '../../auth/access_control.js';

interface LoginScreenProps {
  onAuthenticated: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onAuthenticated }) => {
  const usernameId = useId();
  const passwordId = useId();
  const errorId = useId();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!credentialsAreValid(username, password)) {
      setError('The username or password is incorrect. Please try again.');
      return;
    }
    persistAccess();
    onAuthenticated();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[34rem] w-[34rem] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-48 -right-32 h-[38rem] w-[38rem] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[length:24px_24px]" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <section className="hidden lg:block">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-slate-300 shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Enterprise AI governance workspace
          </div>
          <h1 className="max-w-xl text-5xl font-bold leading-[1.08] tracking-tight text-white">
            Govern every AI workflow with clarity.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
            A unified view of citizen development, risk classification, standards readiness, and responsible
            AI adoption across the enterprise.
          </p>
          <div className="mt-10 flex items-center gap-4 text-sm text-slate-400">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10">
              <ShieldCheck className="h-5 w-5 text-blue-300" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">Protected registry access</p>
              <p>Your trusted-device access remains active for 30 days.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-1 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="rounded-[1.35rem] bg-white p-7 text-slate-900 sm:p-9">
              <div className="mb-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
                  <ShieldCheck className="h-6 w-6 text-amber-300" />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Upbound Group</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight">Welcome back</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in to continue to the AI Workflow Registry.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <label htmlFor={usernameId} className="mb-2 block text-sm font-semibold text-slate-700">
                    Username
                  </label>
                  <div className="relative">
                    <UserRound
                      aria-hidden="true"
                      className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400"
                    />
                    <input
                      id={usernameId}
                      name="username"
                      type="text"
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                      autoFocus
                      value={username}
                      onChange={(event) => {
                        setUsername(event.target.value);
                        if (error) setError('');
                      }}
                      aria-describedby={error ? errorId : undefined}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      placeholder="Enter your username"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={passwordId} className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <LockKeyhole
                      aria-hidden="true"
                      className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400"
                    />
                    <input
                      id={passwordId}
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        if (error) setError('');
                      }}
                      aria-describedby={error ? errorId : undefined}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p
                    id={errorId}
                    role="alert"
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition hover:bg-blue-700 focus-visible:outline-blue-600"
                >
                  Sign in securely
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </form>

              <p className="mt-6 text-center text-xs leading-5 text-slate-400">
                Authorized demonstration access only. Activity may be monitored.
              </p>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-slate-500">
            AI Standards &amp; Governance · Workflow Registry
          </p>
        </section>
      </div>
    </main>
  );
};
