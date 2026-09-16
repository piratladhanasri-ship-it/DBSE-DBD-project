import React from 'react';
import { ShieldAlertIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { dashboardHome } from '../../routes/navigation';

export function Unauthorized() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="mx-auto flex max-w-shell flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-negative/10 text-negative">
        <ShieldAlertIcon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h1 className="mt-4 font-display text-4xl text-navy-900">Access restricted</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-navy-500">
        {isAuthenticated ?
        `Your account role (${user.role}) does not have permission to open that area. The API enforces the same rule server-side.` :
        'You need to be signed in to open that area.'}
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {isAuthenticated ?
        <Button to={dashboardHome[user.role] || '/'} size="lg">
            Go to my dashboard
          </Button> :

        <Button to="/login" size="lg">
            Log in
          </Button>
        }
        <Button to="/auctions" size="lg" variant="outline">
          Browse auctions
        </Button>
      </div>
    </div>);

}