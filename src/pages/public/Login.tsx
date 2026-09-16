import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircleIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Field, TextInput } from '../../components/ui/Field';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validateLogin, isEmpty } from '../../utils/validation';
import { demoAccounts } from '../../data/users';
import { dashboardHome } from '../../routes/navigation';

export function Login() {
  const { login, submitting } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ email: '', password: '', remember: true });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const expired = new URLSearchParams(location.search).get('expired');

  function set(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setFormError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    if (!isEmpty(nextErrors)) return;

    try {
      const user = await login({ email: values.email, password: values.password });
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`, 'You are signed in.');
      navigate(location.state?.from || dashboardHome[user.role] || '/', { replace: true });
    } catch (err) {
      setFormError(err?.message || 'We could not sign you in. Please try again.');
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-navy-900">Log in to BidVault</h1>
      <p className="mt-1.5 text-sm text-navy-500">Access your bids, watchlist and settlements.</p>

      {expired ?
      <p className="mt-5 flex items-start gap-2 rounded-lg border border-gold-200 bg-gold-50 p-3 text-sm text-gold-600">
          <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Your session expired. Please log in again.
        </p> :
      null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {formError ?
        <p className="flex items-start gap-2 rounded-lg border border-negative/30 bg-negative/5 p-3 text-sm text-negative" role="alert">
            <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {formError}
          </p> :
        null}

        <Field label="Email address" htmlFor="email" error={errors.email} required>
          <TextInput
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            invalid={Boolean(errors.email)} />
          
        </Field>

        <Field label="Password" htmlFor="password" error={errors.password} required>
          <TextInput
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={values.password}
            onChange={(e) => set('password', e.target.value)}
            invalid={Boolean(errors.password)} />
          
        </Field>

        <div className="flex items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-navy-600">
            <input
              type="checkbox"
              checked={values.remember}
              onChange={(e) => set('remember', e.target.checked)}
              className="h-4 w-4 rounded border-navy-200 text-navy-900 focus:ring-navy-200" />
            
            Remember me
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-navy-600 transition-colors duration-150 ease-out hover:text-navy-900">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" loading={submitting} className="w-full">
          Log in
        </Button>
      </form>

      <p className="mt-5 text-sm text-navy-500">
        New to BidVault?{' '}
        <Link to="/register" className="font-semibold text-navy-900 underline-offset-2 hover:underline">
          Create an account
        </Link>
      </p>

      <div className="mt-8 rounded-card border border-line bg-mist p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">Demo accounts</p>
        <ul className="mt-3 space-y-2">
          {demoAccounts.map((account) =>
          <li key={account.email} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-navy-900">{account.label}</p>
                <p className="truncate font-mono text-xs text-navy-500">
                  {account.email} · {account.password}
                </p>
              </div>
              <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setValues({ email: account.email, password: account.password, remember: true })}>
              
                Use
              </Button>
            </li>
          )}
        </ul>
      </div>
    </div>);

}