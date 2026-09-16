import React from 'react';
import { InboxIcon } from 'lucide-react';
import { cn } from '../utils/cn';
import { Button } from './ui/Button';

export function EmptyState({ icon: Icon = InboxIcon, title, description, actionLabel, actionTo, onAction, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-navy-50 text-navy-400">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="text-base font-semibold text-navy-900">{title}</p>
      {description ? <p className="mt-1.5 max-w-sm text-sm text-navy-500">{description}</p> : null}
      {actionLabel ?
      <Button to={actionTo} onClick={onAction} variant="outline" size="sm" className="mt-5">
          {actionLabel}
        </Button> :
      null}
    </div>);

}

/** Inline error surface for a failed service call. */
export function ErrorState({ message = 'We could not load this right now.', onRetry, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-12 text-center', className)}>
      <p className="text-sm font-semibold text-navy-900">Something went wrong</p>
      <p className="max-w-sm text-sm text-navy-500">{message}</p>
      {onRetry ?
      <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button> :
      null}
    </div>);

}