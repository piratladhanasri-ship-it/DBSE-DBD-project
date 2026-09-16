import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon, CheckCheckIcon } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Panel } from '../../components/DataTable';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/ui/Button';
import { useNotifications } from '../../context/NotificationContext';
import { relativeTime, formatDateTime } from '../../utils/format';
import { cn } from '../../utils/cn';

const FILTERS = [
{ value: 'all', label: 'All' },
{ value: 'unread', label: 'Unread' },
{ value: 'bidding', label: 'Bidding' },
{ value: 'payments', label: 'Payments' }];


const GROUPS = {
  bidding: ['outbid', 'bid', 'ending', 'won', 'ended'],
  payments: ['payment']
};

const TYPE_STYLE = {
  outbid: 'bg-negative/10 text-negative',
  ending: 'bg-gold-50 text-gold-600',
  won: 'bg-positive/10 text-positive',
  payment: 'bg-positive/10 text-positive',
  approved: 'bg-positive/10 text-positive',
  dispute: 'bg-negative/10 text-negative',
  bid: 'bg-navy-50 text-navy-600',
  pending: 'bg-gold-50 text-gold-600',
  ended: 'bg-navy-50 text-navy-500'
};

export function Notifications() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [filter, setFilter] = useState('all');

  const rows = useMemo(() => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter((n) => !n.isRead);
    return notifications.filter((n) => (GROUPS[filter] || []).includes(n.type));
  }, [notifications, filter]);

  return (
    <>
      <PageHeader
        title="Notifications"
        description={unreadCount ? `${unreadCount} unread alerts` : 'You are all caught up.'}
        actions={
        unreadCount ?
        <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheckIcon className="h-4 w-4" aria-hidden="true" />
              Mark all as read
            </Button> :
        null
        } />
      

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Notification filters">
        {FILTERS.map((f) =>
        <button
          key={f.value}
          type="button"
          role="tab"
          aria-selected={filter === f.value}
          onClick={() => setFilter(f.value)}
          className={cn(
            'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 ease-out',
            filter === f.value ? 'bg-navy-900 text-white' : 'border border-line bg-white text-navy-600 hover:border-navy-300'
          )}>
          
            {f.label}
          </button>
        )}
      </div>

      <Panel title={`${rows.length} notifications`}>
        {rows.length === 0 ?
        <EmptyState icon={BellIcon} title="Nothing here" description="Alerts about bids, closing lots, payments and moderation appear here." /> :

        <ul className="divide-y divide-line">
            {rows.map((n) =>
          <li key={n.id} className={cn('flex flex-col gap-3 p-4 sm:flex-row sm:items-center', !n.isRead && 'bg-navy-50/50')}>
                <span
              className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', TYPE_STYLE[n.type] || 'bg-navy-50 text-navy-500')}
              aria-hidden="true">
              
                  <BellIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy-900">
                    {n.title}
                    {!n.isRead ? <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-negative align-middle" aria-label="Unread" /> : null}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-navy-600">{n.message}</p>
                  <p className="mt-1 text-xs text-navy-400" title={formatDateTime(n.createdAt)}>
                    {relativeTime(n.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {n.link ?
              <Link
                to={n.link}
                onClick={() => markRead(n.id)}
                className="inline-flex h-9 items-center rounded-lg border border-navy-200 px-3 text-sm font-semibold text-navy-800 transition-colors duration-150 ease-out hover:border-navy-900 hover:bg-navy-900 hover:text-white">
                
                      Open
                    </Link> :
              null}
                  {!n.isRead ?
              <Button variant="ghost" size="sm" onClick={() => markRead(n.id)}>
                      Mark read
                    </Button> :
              null}
                </div>
              </li>
          )}
          </ul>
        }
      </Panel>
    </>);

}