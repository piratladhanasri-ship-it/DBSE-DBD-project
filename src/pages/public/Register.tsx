import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircleIcon, GavelIcon, PackageIcon, CheckIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Field, TextInput } from '../../components/ui/Field';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validateRegister, isEmpty } from '../../utils/validation';
import { dashboardHome } from '../../routes/navigation';
import { cn } from '../../utils/cn';

const ROLES = [
{ value: 'buyer', label: 'Buy & bid', icon: GavelIcon, text: 'Bid on lots, track a watchlist and pay for wins.' },
{ value: 'seller', label: 'Sell items', icon: PackageIcon, text: 'List lots for verification, monitor bids and get settled.' }];


export function Register() {
  const { register, submitting } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'buyer' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  function set(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setFormError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validateRegister(values);
    setErrors(nextErrors);
    if (!isEmpty(nextErrors)) return;

    try {
      const user = await register(values);
      toast.success('Account created', `You are signed in as a ${user.role}.`);
      navigate(dashboardHome[user.role] || '/', { replace: true });
    } catch (err) {
      setFormError(err?.message || 'Registration failed. Please try again.');
    }
  }

  const strength = getStrength(values.password);

  return (
    <div>
      <h1 className="font-display text-3xl text-navy-900">Create your account</h1>
      <p className="mt-1.5 text-sm text-navy-500">One account covers bidding and selling — pick your starting role.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {formError ?
        <p className="flex items-start gap-2 rounded-lg border border-negative/30 bg-negative/5 p-3 text-sm text-negative" role="alert">
            <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {formError}
          </p> :
        null}

        <Field label="Full name" htmlFor="name" error={errors.name} required>
          <TextInput
            id="name"
            autoComplete="name"
            placeholder="Rhea Kulkarni"
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            invalid={Boolean(errors.name)} />
          
        </Field>

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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" htmlFor="password" error={errors.password} hint={`Strength: ${strength.label}`} required>
            <TextInput
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={values.password}
              onChange={(e) => set('password', e.target.value)}
              invalid={Boolean(errors.password)} />
            
          </Field>
          <Field label="Confirm password" htmlFor="confirm" error={errors.confirmPassword} required>
            <TextInput
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter password"
              value={values.confirmPassword}
              onChange={(e) => set('confirmPassword', e.target.value)}
              invalid={Boolean(errors.confirmPassword)} />
            
          </Field>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-navy-800">
            How will you use BidVault?<span className="ml-0.5 text-negative">*</span>
          </legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {ROLES.map((role) => {
              const selected = values.role === role.value;
              return (
                <label
                  key={role.value}
                  className={cn(
                    'cursor-pointer rounded-card border p-4 transition-colors duration-150 ease-out',
                    selected ? 'border-navy-900 bg-navy-50' : 'border-line bg-white hover:border-navy-300'
                  )}>
                  
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={selected}
                    onChange={() => set('role', role.value)}
                    className="sr-only" />
                  
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-navy-700">
                      <role.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    {selected ? <CheckIcon className="h-4 w-4 text-navy-900" aria-hidden="true" /> : null}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-navy-900">{role.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-navy-500">{role.text}</p>
                </label>);

            })}
          </div>
          {errors.role ?
          <p className="mt-1.5 text-xs font-medium text-negative" role="alert">
              {errors.role}
            </p> :
          null}
        </fieldset>

        <Button type="submit" size="lg" loading={submitting} className="w-full">
          Create account
        </Button>
        <p className="text-xs text-navy-400">
          By registering you agree to the bidding terms: bids are binding and winning bids must be paid within 72 hours.
        </p>
      </form>

      <p className="mt-5 text-sm text-navy-500">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-navy-900 underline-offset-2 hover:underline">
          Log in
        </Link>
      </p>
    </div>);

}

function getStrength(password = '') {
  if (password.length === 0) return { label: 'enter a password' };
  if (password.length < 6) return { label: 'too short' };
  if (password.length < 10) return { label: 'fair' };
  return { label: /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password) ? 'strong' : 'good' };
}