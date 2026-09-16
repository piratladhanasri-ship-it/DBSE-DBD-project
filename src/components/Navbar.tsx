import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { MenuIcon, XIcon, ChevronDownIcon, LogOutIcon, UserIcon, SettingsIcon, LayoutDashboardIcon } from 'lucide-react';
import { Logo } from './Logo';
import { Button } from './ui/Button';
import { NotificationDropdown } from './NotificationDropdown';
import { useAuth } from '../context/AuthContext';
import { guestNav, dashboardHome } from '../routes/navigation';
import { initials } from '../utils/format';
import { cn } from '../utils/cn';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const linkClass = ({ isActive }) =>
  cn(
    'text-sm font-medium transition-colors duration-150 ease-out',
    isActive ? 'text-navy-900' : 'text-navy-500 hover:text-navy-900'
  );

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-shell items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="ml-6 hidden items-center gap-6 md:flex" aria-label="Main">
          {guestNav.map((item) =>
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
              {item.label}
            </NavLink>
          )}
          <NavLink to="/how-it-works" className={linkClass}>
            How it works
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated ?
          <>
              <NotificationDropdown />
              <div className="relative" ref={menuRef}>
                <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex h-10 items-center gap-2 rounded-lg px-2 text-sm font-medium text-navy-800 transition-colors duration-150 ease-out hover:bg-navy-50"
                aria-expanded={menuOpen}>
                
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-900 text-[11px] font-semibold text-white">
                    {initials(user.name)}
                  </span>
                  <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
                  <ChevronDownIcon className="h-4 w-4 text-navy-400" aria-hidden="true" />
                </button>
                {menuOpen ?
              <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-card border border-line bg-white shadow-pop">
                    <div className="border-b border-line px-4 py-3">
                      <p className="text-sm font-semibold text-navy-900">{user.name}</p>
                      <p className="truncate text-xs text-navy-500">{user.email}</p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-gold-600">{user.role}</p>
                    </div>
                    <MenuLink to={dashboardHome[user.role] || '/'} icon={LayoutDashboardIcon} label="Dashboard" />
                    <MenuLink to="/profile" icon={UserIcon} label="Profile" />
                    <MenuLink to="/settings" icon={SettingsIcon} label="Settings" />
                    <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 border-t border-line px-4 py-2.5 text-left text-sm font-medium text-negative transition-colors duration-150 ease-out hover:bg-negative/5">
                  
                      <LogOutIcon className="h-4 w-4" aria-hidden="true" />
                      Log out
                    </button>
                  </div> :
              null}
              </div>
            </> :

          <div className="hidden items-center gap-2 sm:flex">
              <Button to="/login" variant="ghost" size="sm">
                Log in
              </Button>
              <Button to="/register" size="sm">
                Create account
              </Button>
            </div>
          }

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-navy-700 transition-colors duration-150 ease-out hover:bg-navy-50 md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}>
            
            {mobileOpen ? <XIcon className="h-5 w-5" aria-hidden="true" /> : <MenuIcon className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileOpen ?
      <div className="border-t border-line bg-white md:hidden">
          <nav className="mx-auto flex max-w-shell flex-col px-4 py-2" aria-label="Mobile">
            {[...guestNav, { label: 'How it works', to: '/how-it-works' }].map((item) =>
          <Link
            key={item.to}
            to={item.to}
            className="rounded-lg px-2 py-3 text-sm font-medium text-navy-700 transition-colors duration-150 ease-out hover:bg-mist">
            
                {item.label}
              </Link>
          )}
            {!isAuthenticated ?
          <div className="flex gap-2 border-t border-line py-3">
                <Button to="/login" variant="outline" size="sm" className="flex-1">
                  Log in
                </Button>
                <Button to="/register" size="sm" className="flex-1">
                  Create account
                </Button>
              </div> :

          <Link
            to={dashboardHome[user.role] || '/'}
            className="rounded-lg px-2 py-3 text-sm font-semibold text-navy-900 transition-colors duration-150 ease-out hover:bg-mist">
            
                Go to dashboard
              </Link>
          }
          </nav>
        </div> :
      null}
    </header>);

}

function MenuLink({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-navy-700 transition-colors duration-150 ease-out hover:bg-mist">
      
      <Icon className="h-4 w-4 text-navy-400" aria-hidden="true" />
      {label}
    </Link>);

}