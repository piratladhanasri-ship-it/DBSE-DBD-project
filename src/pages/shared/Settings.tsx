import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOutIcon, KeyRoundIcon } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Panel } from '../../components/DataTable';
import { Button } from '../../components/ui/Button';
import { Field, TextInput, SelectInput } from '../../components/ui/Field';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { changePassword } from '../../services/authService';
import { updatePreferences } from '../../services/userService';
import { validatePasswordChange, isEmpty } from '../../utils/validation';
import { cn } from '../../utils/cn';

const PREFERENCES = [
{ key: 'outbid', label: 'Outbid alerts', text: 'Tell me when another bidder passes my bid.' },
{ key: 'ending', label: 'Closing reminders', text: 'Remind me an hour before a watched lot closes.' },
{ key: 'won', label: 'Win confirmations', text: 'Notify me when I win a lot and payment is due.' },
{ key: 'payment', label: 'Payment receipts', text: 'Email a receipt after every successful payment.' },
{ key: 'marketing', label: 'New catalogue digests', text: 'Weekly summary of newly approved lots in my categories.' }];


export function Settings() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState({ outbid: true, ending: true, won: true, payment: true, marketing: false });
  const [channel, setChannel] = useState('email');
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function togglePref(key) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    await updatePreferences(user.id, { ...next, channel });
    toast.success('Preferences saved', `${PREFERENCES.find((p) => p.key === key).label} ${next[key] ? 'enabled' : 'disabled'}.`);
  }

  async function handlePassword(e) {
    e.preventDefault();
    const nextErrors = validatePasswordChange(password);
    setErrors(nextErrors);
    if (!isEmpty(nextErrors)) return;
    setSaving(true);
    await changePassword({ currentPassword: password.current, newPassword: password.next });
    setSaving(false);
    setPassword({ current: '', next: '', confirm: '' });
    toast.success('Password updated', 'Use your new password the next time you log in.');
  }

  return (
    <>
      <PageHeader title="Settings" description="Account preferences, notification channels and session management." />

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <Panel title="Account settings" description="Basic account configuration">
            <div className="space-y-4 p-5">
              <Field label="Account email" htmlFor="s-email" hint="Change your email from the profile page.">
                <TextInput id="s-email" value={user.email} disabled />
              </Field>
              <Field label="Preferred notification channel" htmlFor="s-channel">
                <SelectInput
                  id="s-channel"
                  value={channel}
                  onChange={async (e) => {
                    setChannel(e.target.value);
                    await updatePreferences(user.id, { ...prefs, channel: e.target.value });
                    toast.success('Channel updated', `Alerts will be delivered by ${e.target.value}.`);
                  }}>
                  
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="in-app">In-app only</option>
                </SelectInput>
              </Field>
              <Field label="Display currency" htmlFor="s-currency">
                <SelectInput id="s-currency" defaultValue="INR">
                  <option value="INR">Indian Rupee (₹)</option>
                </SelectInput>
              </Field>
            </div>
          </Panel>

          <Panel title="Notification preferences" description="Which alerts you receive from the platform">
            <ul className="divide-y divide-line">
              {PREFERENCES.map((pref) =>
              <li key={pref.key} className="flex items-start justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-navy-900">{pref.label}</p>
                    <p className="mt-0.5 text-sm text-navy-500">{pref.text}</p>
                  </div>
                  <button
                  type="button"
                  role="switch"
                  aria-checked={prefs[pref.key]}
                  aria-label={pref.label}
                  onClick={() => togglePref(pref.key)}
                  className={cn(
                    'relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ease-out',
                    prefs[pref.key] ? 'bg-navy-900' : 'bg-navy-200'
                  )}>
                  
                    <span
                    className={cn(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-150 ease-out',
                      prefs[pref.key] ? 'translate-x-[22px]' : 'translate-x-0.5'
                    )} />
                  
                  </button>
                </li>
              )}
            </ul>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Change password">
            <form onSubmit={handlePassword} className="space-y-4 p-5" noValidate>
              <Field label="Current password" htmlFor="pw-current" error={errors.current} required>
                <TextInput
                  id="pw-current"
                  type="password"
                  autoComplete="current-password"
                  value={password.current}
                  onChange={(e) => setPassword({ ...password, current: e.target.value })}
                  invalid={Boolean(errors.current)} />
                
              </Field>
              <Field label="New password" htmlFor="pw-next" error={errors.next} hint="At least 8 characters." required>
                <TextInput
                  id="pw-next"
                  type="password"
                  autoComplete="new-password"
                  value={password.next}
                  onChange={(e) => setPassword({ ...password, next: e.target.value })}
                  invalid={Boolean(errors.next)} />
                
              </Field>
              <Field label="Confirm new password" htmlFor="pw-confirm" error={errors.confirm} required>
                <TextInput
                  id="pw-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={password.confirm}
                  onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                  invalid={Boolean(errors.confirm)} />
                
              </Field>
              <Button type="submit" size="sm" loading={saving}>
                <KeyRoundIcon className="h-4 w-4" aria-hidden="true" />
                Update password
              </Button>
              <p className="text-xs text-navy-400">
                Passwords are hashed with bcrypt on the server. The frontend only ever sends them over HTTPS to /api/auth.
              </p>
            </form>
          </Panel>

          <Panel title="Session">
            <div className="space-y-3 p-5">
              <p className="text-sm text-navy-600">
                Logging out clears your JWT from this browser. You will need to sign in again to bid, list or moderate.
              </p>
              <Button variant="danger" size="sm" onClick={() => setLoggingOut(true)}>
                <LogOutIcon className="h-4 w-4" aria-hidden="true" />
                Log out
              </Button>
            </div>
          </Panel>
        </div>
      </div>

      <ConfirmationDialog
        open={loggingOut}
        onClose={() => setLoggingOut(false)}
        onConfirm={() => {
          logout();
          navigate('/');
        }}
        title="Log out of BidVault?"
        message="Any lot you are watching stays saved to your account. You can log back in at any time."
        confirmLabel="Log out"
        tone="danger" />
      
    </>);

}