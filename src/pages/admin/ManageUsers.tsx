import React, { useMemo, useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Panel, DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { SearchBar } from '../../components/SearchBar';
import { SelectInput } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { useToast } from '../../context/ToastContext';
import { setUserStatus } from '../../services/userService';
import { users as seedUsers } from '../../data/users';
import { formatDate, initials } from '../../utils/format';

export function ManageUsers() {
  const toast = useToast();
  const [users, setUsers] = useState(seedUsers);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');
  const [pending, setPending] = useState(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.
    filter((u) => role === 'all' ? true : u.role === role).
    filter((u) => !q ? true : `${u.name} ${u.email}`.toLowerCase().includes(q));
  }, [users, query, role]);

  async function applyStatus(user, status) {
    await setUserStatus(user.id, status);
    setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status } : u));
    toast.success(status === 'suspended' ? 'Account suspended' : 'Account activated', user.name);
    setPending(null);
  }

  const columns = [
  {
    key: 'name',
    header: 'User',
    render: (row) =>
    <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-50 text-[11px] font-semibold text-navy-600">
            {initials(row.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-navy-900">{row.name}</p>
            <p className="truncate text-xs text-navy-400">{row.id}</p>
          </div>
        </div>

  },
  { key: 'email', header: 'Email', render: (row) => <span className="text-navy-600">{row.email}</span> },
  { key: 'role', header: 'Role', render: (row) => <span className="capitalize text-navy-700">{row.role}</span> },
  { key: 'status', header: 'Account status', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'joined', header: 'Joined', hideOnMobile: true, render: (row) => <span className="nums text-navy-600">{formatDate(row.joinedAt)}</span> },
  {
    key: 'actions',
    header: 'Actions',
    align: 'right',
    render: (row) =>
    <div className="flex justify-end gap-2">
          {row.status === 'suspended' ?
      <Button size="sm" variant="outline" onClick={() => applyStatus(row, 'active')}>
              Reactivate
            </Button> :

      <Button size="sm" variant="danger" onClick={() => setPending(row)} disabled={row.role === 'admin'}>
              Suspend
            </Button>
      }
        </div>

  }];


  return (
    <>
      <PageHeader title="Manage users" description="Buyer, seller and administrator accounts with their verification state." />

      <div className="grid gap-4 sm:grid-cols-4">
        {[
        { label: 'All users', value: users.length },
        { label: 'Buyers', value: users.filter((u) => u.role === 'buyer').length },
        { label: 'Sellers', value: users.filter((u) => u.role === 'seller').length },
        { label: 'Suspended', value: users.filter((u) => u.status === 'suspended').length }].
        map((stat) =>
        <div key={stat.label} className="rounded-card border border-line bg-white p-4 shadow-card">
            <p className="text-sm text-navy-500">{stat.label}</p>
            <p className="nums mt-1 text-xl font-semibold text-navy-900">{stat.value}</p>
          </div>
        )}
      </div>

      <Panel
        title={`${rows.length} accounts`}
        action={
        <div className="flex flex-wrap items-center gap-2">
            <SearchBar value={query} onChange={setQuery} placeholder="Search name or email" id="user-search" className="w-52" />
            <div className="w-36">
              <label htmlFor="role-filter" className="sr-only">
                Filter by role
              </label>
              <SelectInput id="role-filter" value={role} onChange={(e) => setRole(e.target.value)} className="h-9 py-1.5 text-sm">
                <option value="all">All roles</option>
                <option value="buyer">Buyers</option>
                <option value="seller">Sellers</option>
                <option value="admin">Admins</option>
              </SelectInput>
            </div>
          </div>
        }>
        
        <DataTable
          columns={columns}
          rows={rows}
          caption="Platform users"
          empty={{ title: 'No users match', description: 'Try a different search term or role filter.' }} />
        
      </Panel>

      <ConfirmationDialog
        open={Boolean(pending)}
        onClose={() => setPending(null)}
        onConfirm={() => applyStatus(pending, 'suspended')}
        title="Suspend this account?"
        message={`${pending?.name} will not be able to bid, list or log in until the account is reactivated.`}
        confirmLabel="Suspend account"
        tone="danger" />
      
    </>);

}