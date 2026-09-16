import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheckIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Field, TextInput } from '../../components/ui/Field';
import { requestPasswordReset } from '../../services/authService';
import { EMAIL_RE } from '../../utils/validation';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return setError('Email is required.');
    if (!EMAIL_RE.test(email)) return setError('Enter a valid email address.');
    setError('');
    setLoading(true);
    await requestPasswordReset(email);
    setLoading(false);
    setSent(true);
    return undefined;
  }

  if (sent) {
    return (
      <div>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-positive/10 text-positive">
          <MailCheckIcon className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="mt-4 font-display text-3xl text-navy-900">Check your inbox</h1>
        <p className="mt-2 text-sm leading-relaxed text-navy-500">
          If an account exists for <span className="font-medium text-navy-800">{email}</span>, we have sent a password reset link. It
          expires in 30 minutes.
        </p>
        <Button to="/login" variant="outline" className="mt-6">
          Back to login
        </Button>
      </div>);

  }

  return (
    <div>
      <h1 className="font-display text-3xl text-navy-900">Reset your password</h1>
      <p className="mt-1.5 text-sm text-navy-500">Enter the email on your account and we will send a reset link.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <Field label="Email address" htmlFor="reset-email" error={error} required>
          <TextInput
            id="reset-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            invalid={Boolean(error)} />
          
        </Field>
        <Button type="submit" size="lg" loading={loading} className="w-full">
          Send reset link
        </Button>
      </form>

      <p className="mt-5 text-sm text-navy-500">
        Remembered it?{' '}
        <Link to="/login" className="font-semibold text-navy-900 underline-offset-2 hover:underline">
          Log in
        </Link>
      </p>
    </div>);

}