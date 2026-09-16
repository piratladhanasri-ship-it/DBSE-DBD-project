import React from 'react';
import { ClockIcon } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';
import { cn } from '../utils/cn';

/**
 * Live countdown. `variant="panel"` is the large display on the auction details
 * page; `variant="inline"` is the compact form used on cards and in tables.
 */
export function CountdownTimer({ endAt, status = 'live', variant = 'inline', className, onEnd }) {
  const { days, hours, minutes, seconds, label, ended, remainingMs } = useCountdown(endAt);
  const urgent = !ended && remainingMs <= 60 * 1000;
  const soon = !ended && remainingMs <= 60 * 60 * 1000;

  React.useEffect(() => {
    if (ended && onEnd) onEnd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ended]);

  if (variant === 'panel') {
    const parts = [
    { value: days, unit: 'days' },
    { value: hours, unit: 'hrs' },
    { value: minutes, unit: 'min' },
    { value: seconds, unit: 'sec' }].
    filter((p, i) => !(i === 0 && days === 0));

    return (
      <div className={cn('rounded-card border p-4', urgent ? 'border-negative/30 bg-negative/5' : 'border-line bg-mist', className)}>
        <p className={cn('text-xs font-semibold uppercase tracking-wide', urgent ? 'text-negative' : 'text-navy-500')}>
          {ended || status === 'ended' ? 'Auction closed' : urgent ? 'Final minute — closing' : 'Auction ends in'}
        </p>
        {ended || status === 'ended' ?
        <p className="mt-2 text-2xl font-semibold text-navy-500">00:00:00</p> :

        <div className="mt-2 flex items-end gap-3">
            {parts.map((part) =>
          <div key={part.unit} className="text-center">
                <p className={cn('nums text-3xl font-semibold leading-none', urgent ? 'text-negative' : 'text-navy-900')}>
                  {String(part.value).padStart(2, '0')}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-navy-400">{part.unit}</p>
              </div>
          )}
          </div>
        }
      </div>);

  }

  return (
    <span
      className={cn(
        'nums inline-flex items-center gap-1.5 text-sm font-medium',
        ended || status === 'ended' ? 'text-navy-400' : urgent ? 'text-negative' : soon ? 'text-gold-600' : 'text-navy-600',
        className
      )}>
      
      <ClockIcon className="h-3.5 w-3.5" aria-hidden="true" />
      {ended || status === 'ended' ? 'Closed' : label}
    </span>);

}