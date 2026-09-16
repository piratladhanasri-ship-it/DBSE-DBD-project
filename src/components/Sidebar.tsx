import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOutIcon, XIcon } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { navForRole } from '../routes/navigation';
import { initials } from '../utils/format';
import { cn } from '../utils/cn';

/** Role-aware dashboard sidebar. Becomes an off-canvas drawer below `lg`. */
export function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = navForRole(user?.role);

  const itemClass = ({ isActive }) =>
  cn(
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ease-out',
    isActive ? 'bg-navy-800 text-white' : 'text-navy-200 hover:bg-navy-800/60 hover:text-white'
  );

  const content =
  <div className="flex h-full flex-col bg-navy-900">
      <div className="flex h-16 shrink-0 items-center justify-between px-4">
        <Logo tone="light" to={`/${user?.role === 'buyer' ? 'buyer' : user?.role === 'seller' ? 'seller' : 'admin'}`} />
        <button
        type="button"
        onClick={onClose}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-navy-300 transition-colors duration-150 ease-out hover:bg-navy-800 hover:text-white lg:hidden"
        aria-label="Close menu">
        
          <XIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="mx-4 mb-4 flex items-center gap-3 rounded-lg bg-navy-800 p-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-400 text-xs font-semibold text-navy-900">
          {initials(user?.name || '')}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gold-300">{user?.role}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4" aria-label="Dashboard">
        {items.map((item) =>
      <NavLink key={item.to} to={item.to} end={item.end} className={itemClass} onClick={onClose}>
            <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {item.label}
          </NavLink>
      )}
      </nav>

      <div className="border-t border-navy-800 p-3">
        <button
        type="button"
        onClick={() => {
          logout();
          navigate('/');
        }}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-navy-200 transition-colors duration-150 ease-out hover:bg-navy-800 hover:text-white">
        
          <LogOutIcon className="h-4 w-4" aria-hidden="true" />
          Log out
        </button>
      </div>
    </div>;


  return (
    <>
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed bottom-0 left-0 top-0 w-64">{content}</div>
      </aside>

      {open ?
      <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-900/50" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[80%] shadow-pop">{content}</div>
        </div> :
      null}
    </>);

}