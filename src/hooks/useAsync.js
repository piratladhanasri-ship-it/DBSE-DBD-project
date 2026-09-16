import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs an async service call and exposes loading / error / data so every screen
 * can render the same loading, empty and error states.
 */
export function useAsync(asyncFn, deps = [], { immediate = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      if (mounted.current) setData(result);
      return result;
    } catch (err) {
      if (mounted.current) setError(err?.message || 'Something went wrong.');
      return null;
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, deps);

  useEffect(() => {
    if (immediate) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, immediate]);

  return { data, loading, error, reload: run, setData };
}