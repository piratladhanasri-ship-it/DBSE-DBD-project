import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BellIcon } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { relativeTime } from '../utils/format';
import { cn } from '../utils/cn';

const TYPE_DOT = {
  outbid: 'bg-negative',
  ending: 'bg-gold-400',
  won: 'bg-positive',
  payment: 'bg-positive',
  approved: 'bg-positive',
  dispute: 'bg-negative',
  bid: 'bg-navy-400',
  pending: 'bg-gold-400',
  ended: 'bg-navy-300'
};

export function NotificationDropdown() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-navy-600 transition-colors duration-150 ease-out hover:bg-navy-50 hover:text-navy-900"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}>
        
        <BellIcon className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 ?
        <span className="nums absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-negative px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span> :
        null}
      </button>

      <AnimatePresence>
        {open ?
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
          className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-card border border-line bg-white shadow-pop">
          
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="text-sm font-semibold text-navy-900">Notifications</p>
              {unreadCount > 0 ?
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs font-semibold text-navy-500 transition-colors duration-150 ease-out hover:text-navy-900">
              
                  Mark all read
                </button> :
            null}
            </div>

            {notifications.length === 0 ?
          <p className="px-4 py-8 text-center text-sm text-navy-500">You are all caught up.</p> :

          <ul className="max-h-80 divide-y divide-line overflow-y-auto">
                {notifications.slice(0, 6).map((n) =>
            <li key={n.id}>
                    <Link
                to={n.link || '/notifications'}
                onClick={() => {
                  markRead(n.id);
                  setOpen(false);
                }}
                className={cn(
                  'flex gap-3 px-4 py-3 transition-colors duration-150 ease-out hover:bg-mist',
                  !n.isRead && 'bg-navy-50/60'
                )}>
                
                      <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', TYPE_DOT[n.type] || 'bg-navy-300')} aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-navy-900">{n.title}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-navy-500">{n.message}</span>
                        <span className="mt-1 block text-[11px] text-navy-400">{relativeTime(n.createdAt)}</span>
                      </span>
                    </Link>
                  </li>
            )}
              </ul>
          }

            <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-line px-4 py-3 text-center text-sm font-semibold text-navy-700 transition-colors duration-150 ease-out hover:bg-mist">
            
              View all notifications
            </Link>
          </motion.div> :
        null}
      </AnimatePresence>
    </div>);

}