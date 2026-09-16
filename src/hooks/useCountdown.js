import { useEffect, useMemo, useState } from 'react';
import { countdownParts } from '../utils/format';

/**
 * Ticks once per second and returns the formatted remaining time for a target
 * timestamp. Used by CountdownTimer, auction cards and the bidding panel.
 */
export function useCountdown(target) {
  const targetMs = useMemo(() => target ? new Date(target).getTime() : 0, [target]);
  const [remaining, setRemaining] = useState(() => Math.max(0, targetMs - Date.now()));

  useEffect(() => {
    setRemaining(Math.max(0, targetMs - Date.now()));
    if (!targetMs) return undefined;
    const id = setInterval(() => {
      setRemaining(Math.max(0, targetMs - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  return { ...countdownParts(remaining), remainingMs: remaining };
}