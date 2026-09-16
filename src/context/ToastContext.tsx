import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2Icon, InfoIcon, AlertTriangleIcon, XIcon } from 'lucide-react';

const ToastContext = createContext(null);

const TONES = {
  success: { icon: CheckCircle2Icon, className: 'text-positive', bar: 'bg-positive' },
  error: { icon: AlertTriangleIcon, className: 'text-negative', bar: 'bg-negative' },
  info: { icon: InfoIcon, className: 'text-navy-500', bar: 'bg-navy-500' }
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (toast) => {
      const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-2), { id, tone: 'info', ...toast }]);
      setTimeout(() => dismiss(id), toast.duration || 4200);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      toast: push,
      success: (title, description) => push({ tone: 'success', title, description }),
      error: (title, description) => push({ tone: 'error', title, description }),
      info: (title, description) => push({ tone: 'info', title, description })
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-6 sm:items-end"
        role="status"
        aria-live="polite">
        
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const tone = TONES[t.tone] || TONES.info;
            const Icon = tone.icon;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                className="pointer-events-auto flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-card border border-line bg-white p-3.5 shadow-pop">
                
                <span className={`mt-0.5 shrink-0 ${tone.className}`}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy-900">{t.title}</p>
                  {t.description ? <p className="mt-0.5 text-sm text-navy-500">{t.description}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="shrink-0 rounded p-1 text-navy-300 transition-colors duration-150 hover:bg-navy-50 hover:text-navy-600"
                  aria-label="Dismiss notification">
                  
                  <XIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </motion.div>);

          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>);

}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}