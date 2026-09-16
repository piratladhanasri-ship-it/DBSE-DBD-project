import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { cn } from '../utils/cn';

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ?
      <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
          className="absolute inset-0 bg-navy-900/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={onClose} />
        
          <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
          className={cn(
            'relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-card bg-white shadow-pop sm:rounded-card',
            size === 'sm' && 'sm:max-w-md',
            size === 'md' && 'sm:max-w-lg',
            size === 'lg' && 'sm:max-w-2xl'
          )}>
          
            <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-navy-900">{title}</h2>
                {description ? <p className="mt-1 text-sm text-navy-500">{description}</p> : null}
              </div>
              <button
              type="button"
              onClick={onClose}
              className="rounded p-1.5 text-navy-400 transition-colors duration-150 ease-out hover:bg-navy-50 hover:text-navy-900"
              aria-label="Close dialog">
              
                <XIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </header>
            <div className="px-5 py-4">{children}</div>
            {footer ? <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-4">{footer}</footer> : null}
          </motion.div>
        </div> :
      null}
    </AnimatePresence>);

}