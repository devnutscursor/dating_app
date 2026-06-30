import { useCallback, useEffect, useState } from 'react';
import {
  Search,
  MoreVertical,
  UserX,
  Mail,
  Plus,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
} from 'lucide-react';
import { toast } from 'sonner';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api';

type ListTab = 'all' | 'active' | 'blocked' | 'reported';
type RoleFilter = 'all' | 'male' | 'female' | 'moderator';
type OnlineFilter = 'all' | 'online' | 'offline';
type SortField = 'name' | 'coins' | 'createdAt' | 'role' | 'isOnline' | 'isBlocked';

interface AdminListUser {
  id: string;
  email?: string;
  name: string;
  role?: string;
  gender?: string;
  coins: number;
  isOnline: boolean;
  isBlocked?: boolean;
  isVerified: boolean;
  profilePicture?: string;
  createdAt?: string;
}

function formatJoined(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function roleLabel(role?: string) {
  if (role === 'male') return 'Male';
  if (role === 'female') return 'Female';
  if (role === 'moderator') return 'Moderator';
  return role ?? '—';
}

function SortIcon({ active, order }: { active: boolean; order: 'asc' | 'desc' }) {
  if (!active) return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 text-gray-400" aria-hidden />;
  return order === 'asc' ? (
    <ChevronUp className="ml-1 inline h-3.5 w-3.5 text-green-600" aria-hidden />
  ) : (
    <ChevronDown className="ml-1 inline h-3.5 w-3.5 text-green-600" aria-hidden />
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminListUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tab, setTab] = useState<ListTab>('all');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [onlineFilter, setOnlineFilter] = useState<OnlineFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addUserType, setAddUserType] = useState<'male' | 'female' | 'moderator'>('female');
  const [addCoins, setAddCoins] = useState('100');
  const [addSaving, setAddSaving] = useState(false);

  const [editUser, setEditUser] = useState<AdminListUser | null>(null);
  const [editName, setEditName] = useState('');
  const [coinAdjustMode, setCoinAdjustMode] = useState<'add' | 'subtract'>('add');
  const [coinAdjustAmount, setCoinAdjustAmount] = useState('');
  const [editVerified, setEditVerified] = useState(false);
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => window.clearTimeout(t);
  }, [searchQuery]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (onlineFilter !== 'all') params.set('online', onlineFilter);
      params.set('tab', tab);
      if (dateFrom) params.set('createdFrom', dateFrom);
      if (dateTo) params.set('createdTo', dateTo);
      params.set('sort', sortField);
      params.set('order', sortOrder);
      const data = await apiGet<{ users: AdminListUser[] }>(`/admin/users?${params.toString()}`);
      setUsers(data.users);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, onlineFilter, tab, dateFrom, dateTo, sortField, sortOrder]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const onSort = (column: SortField) => {
    if (column === sortField) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(column);
      const descFirst = column === 'coins' || column === 'createdAt' || column === 'isOnline' || column === 'isBlocked';
      setSortOrder(descFirst ? 'desc' : 'asc');
    }
  };

  const refreshRow = (updated: AdminListUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
  };

  const removeRow = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const copyEmail = async (user: AdminListUser) => {
    const email = user.email?.trim();
    if (!email) {
      toast.error('No email on file for this user');
      return;
    }
    try {
      await navigator.clipboard.writeText(email);
      toast.success('Email copied to clipboard');
    } catch {
      toast.error('Could not copy email');
    }
  };

  const openMailto = (user: AdminListUser) => {
    const email = user.email?.trim();
    if (!email) {
      toast.error('No email on file for this user');
      return;
    }
    window.location.href = `mailto:${encodeURIComponent(email)}`;
  };

  const toggleBlock = async (user: AdminListUser, nextBlocked: boolean) => {
    const verb = nextBlocked ? 'block' : 'unblock';
    if (!window.confirm(`${nextBlocked ? 'Block' : 'Unblock'} ${user.name}?`)) return;
    try {
      const data = await apiPatch<{ user: AdminListUser }>(`/admin/users/${user.id}`, { isBlocked: nextBlocked });
      refreshRow(data.user);
      toast.success(`User ${verb}ed`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : `Failed to ${verb} user`);
    }
  };

  const quickBlock = (user: AdminListUser) => {
    void toggleBlock(user, !user.isBlocked);
  };

  const submitAdd = async () => {
    setAddSaving(true);
    try {
      const coinsNum = Number(addCoins);
      await apiPost('/admin/users', {
        name: addName,
        email: addEmail,
        password: addPassword,
        userType: addUserType,
        coins: Number.isFinite(coinsNum) ? coinsNum : 100,
      });
      toast.success('User created');
      setAddOpen(false);
      setAddName('');
      setAddEmail('');
      setAddPassword('');
      setAddUserType('female');
      setAddCoins('100');
      await loadUsers();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not create user');
    } finally {
      setAddSaving(false);
    }
  };

  const openEdit = (user: AdminListUser) => {
    setEditUser(user);
    setEditName(user.name);
    setCoinAdjustMode('add');
    setCoinAdjustAmount('');
    setEditVerified(Boolean(user.isVerified));
    setEditNewPassword('');
    setEditConfirmPassword('');
  };

  const applyCoinPreset = (amount: number) => {
    setCoinAdjustAmount(String(amount));
  };

  const submitEdit = async () => {
    if (!editUser) return;

    const adjustRaw = coinAdjustAmount.trim();
    const adjustNum = adjustRaw === '' ? 0 : Math.trunc(Number(adjustRaw));
    if (adjustRaw !== '' && (!Number.isFinite(adjustNum) || adjustNum <= 0)) {
      toast.error('Enter a valid coin amount greater than 0');
      return;
    }

    const passwordRaw = editNewPassword.trim();
    const confirmRaw = editConfirmPassword.trim();
    if (passwordRaw || confirmRaw) {
      if (passwordRaw.length < 8) {
        toast.error('New password must be at least 8 characters');
        return;
      }
      if (passwordRaw !== confirmRaw) {
        toast.error('Passwords do not match');
        return;
      }
    }

    const payload: {
      name: string;
      isVerified: boolean;
      coinsDelta?: number;
      newPassword?: string;
    } = {
      name: editName,
      isVerified: editVerified,
    };

    if (passwordRaw) {
      payload.newPassword = passwordRaw;
    }

    if (adjustNum > 0) {
      payload.coinsDelta = coinAdjustMode === 'add' ? adjustNum : -adjustNum;
    }

    setEditSaving(true);
    try {
      const data = await apiPatch<{ user: AdminListUser }>(`/admin/users/${editUser.id}`, payload);
      refreshRow(data.user);
      if (payload.coinsDelta) {
        const verb = payload.coinsDelta > 0 ? 'Added' : 'Subtracted';
        const abs = Math.abs(payload.coinsDelta);
        toast.success(`${verb} ${abs} coins — new balance: ${data.user.coins}`);
      } else if (payload.newPassword) {
        toast.success('Password updated — the user must sign in with the new password');
      } else {
        toast.success('User updated');
      }
      setEditUser(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setEditSaving(false);
    }
  };

  const deleteUser = async (user: AdminListUser) => {
    if (!window.confirm(`Permanently delete ${user.name}? This cannot be undone.`)) return;
    try {
      await apiDelete(`/admin/users/${user.id}`);
      removeRow(user.id);
      toast.success('User deleted');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const tabBtn = (key: ListTab, label: string) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      className={`rounded-lg px-4 py-2 font-medium transition-colors ${
        tab === key ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );

  const thBtn = (column: SortField, label: string, align: 'left' | 'right' = 'left') => {
    const alignClass = align === 'right' ? 'text-right' : 'text-left';
    const btnClass = align === 'right' ? 'ml-auto' : '';
    return (
      <th className={`px-6 py-4 ${alignClass} text-sm font-medium text-gray-500`}>
        <button
          type="button"
          onClick={() => onSort(column)}
          className={`inline-flex items-center rounded-md px-1 py-0.5 hover:bg-gray-100 hover:text-gray-800 ${btnClass}`}
        >
          {label}
          <SortIcon active={sortField === column} order={sortOrder} />
        </button>
      </th>
    );
  };

  const toggleVerified = async (user: AdminListUser) => {
    try {
      const data = await apiPatch<{ user: AdminListUser }>(`/admin/users/${user.id}`, {
        isVerified: !user.isVerified,
      });
      refreshRow(data.user);
      toast.success(data.user.isVerified ? 'Marked verified' : 'Verification removed');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const filterSelectClass =
    'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-green-500';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500">Manage user accounts</p>
        </div>
        <Button type="button" className="bg-green-500 hover:bg-green-600" onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {tabBtn('all', 'All')}
            {tabBtn('active', 'Active')}
            {tabBtn('blocked', 'Blocked')}
            {tabBtn('reported', 'Reported')}
          </div>
        </div>

        <div className="flex flex-col flex-wrap gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <span className="whitespace-nowrap">Type</span>
            <select
              className={filterSelectClass}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
            >
              <option value="all">All types</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="moderator">Moderator</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <span className="whitespace-nowrap">Presence</span>
            <select
              className={filterSelectClass}
              value={onlineFilter}
              onChange={(e) => setOnlineFilter(e.target.value as OnlineFilter)}
            >
              <option value="all">Online + offline</option>
              <option value="online">Online only</option>
              <option value="offline">Offline only</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <span className="whitespace-nowrap">Joined from</span>
            <input
              type="date"
              className={filterSelectClass}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <span className="whitespace-nowrap">Joined to</span>
            <input
              type="date"
              className={filterSelectClass}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </label>
          <Button
            type="button"
            variant="outline"
            className="border-gray-200"
            onClick={() => {
              setRoleFilter('all');
              setOnlineFilter('all');
              setDateFrom('');
              setDateTo('');
              setTab('all');
              setSearchQuery('');
            }}
          >
            Reset filters
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {thBtn('name', 'User')}
                {thBtn('role', 'Type')}
                {thBtn('isBlocked', 'Status')}
                {thBtn('isOnline', 'Presence')}
                {thBtn('coins', 'Coins')}
                {thBtn('createdAt', 'Joined')}
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    Loading users…
                  </td>
                </tr>
              )}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    No users match these filters.
                  </td>
                </tr>
              )}
              {!loading &&
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <ProfileAvatar
                          src={user.profilePicture}
                          name={user.name}
                          gender={user.gender}
                          role={user.role}
                          className="h-10 w-10 rounded-full"
                          alt={user.name}
                        />
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{roleLabel(user.role)}</td>
                    <td className="px-6 py-4">
                      {user.isBlocked ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          user.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {user.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{user.coins}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatJoined(user.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="Open email client"
                          className="rounded-lg p-2 hover:bg-gray-100"
                          onClick={() => openMailto(user)}
                        >
                          <Mail className="h-4 w-4 text-gray-500" />
                        </button>
                        <button
                          type="button"
                          title={user.isBlocked ? 'Unblock user' : 'Block user'}
                          className="rounded-lg p-2 hover:bg-gray-100"
                          onClick={() => quickBlock(user)}
                        >
                          <UserX className={`h-4 w-4 ${user.isBlocked ? 'text-gray-400' : 'text-red-500'}`} />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              title="More actions"
                              className="rounded-lg p-2 hover:bg-gray-100"
                            >
                              <MoreVertical className="h-4 w-4 text-gray-500" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => openMailto(user)}>Compose email…</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => void copyEmail(user)}>Copy email</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEdit(user)}>Edit user…</DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => void toggleBlock(user, !user.isBlocked)}
                            >
                              {user.isBlocked ? 'Unblock user' : 'Block user'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => void toggleVerified(user)}>
                              {user.isVerified ? 'Remove verification' : 'Mark verified'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => void deleteUser(user)}
                            >
                              Delete user…
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Creates a <strong>member</strong> (male or female) or a <strong>moderator</strong> account. Admin accounts
            cannot be created from this dialog.
          </p>
          <div className="grid gap-3 py-2">
            <div className="grid gap-2">
              <Label htmlFor="add-name">Name</Label>
              <Input id="add-name" value={addName} onChange={(e) => setAddName(e.target.value)} autoComplete="off" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-password">Password (min 8)</Label>
              <Input
                id="add-password"
                type="password"
                value={addPassword}
                onChange={(e) => setAddPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-type">User type</Label>
              <select
                id="add-type"
                className={filterSelectClass + ' w-full'}
                value={addUserType}
                onChange={(e) => setAddUserType(e.target.value as 'male' | 'female' | 'moderator')}
              >
                <option value="female">Female member</option>
                <option value="male">Male member</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-coins">Starting coins</Label>
              <Input
                id="add-coins"
                inputMode="numeric"
                value={addCoins}
                onChange={(e) => setAddCoins(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-green-500 hover:bg-green-600"
              disabled={addSaving}
              onClick={() => void submitAdd()}
            >
              {addSaving ? 'Creating…' : 'Create user'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent className="flex max-h-[min(90vh,calc(100dvh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="shrink-0 px-6 pt-6 pb-2">
            <DialogTitle>Edit user</DialogTitle>
          </DialogHeader>
          {editUser && (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-2">
                <div className="grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Coins</Label>
                  <p className="text-sm text-gray-600">
                    Current balance:{' '}
                    <span className="font-semibold text-gray-900">{editUser.coins}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Add or subtract relative to the live balance — safe while the user is online.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCoinAdjustMode('add')}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        coinAdjustMode === 'add'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoinAdjustMode('subtract')}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        coinAdjustMode === 'subtract'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Subtract
                    </button>
                  </div>
                  <Input
                    id="edit-coins-adjust"
                    inputMode="numeric"
                    placeholder={
                      coinAdjustMode === 'add' ? 'Amount to add (e.g. 50)' : 'Amount to subtract (e.g. 100)'
                    }
                    value={coinAdjustAmount}
                    onChange={(e) => setCoinAdjustAmount(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    {[50, 100, 250, 500].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => applyCoinPreset(preset)}
                        className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                      >
                        {coinAdjustMode === 'add' ? '+' : '−'}
                        {preset}
                      </button>
                    ))}
                  </div>
                  {coinAdjustAmount.trim() !== '' && Number(coinAdjustAmount) > 0 && (
                    <p className="text-xs text-gray-500">
                      New balance after save:{' '}
                      <span className="font-medium text-gray-800">
                        {Math.max(
                          0,
                          editUser.coins +
                            (coinAdjustMode === 'add' ? 1 : -1) * Math.trunc(Number(coinAdjustAmount) || 0),
                        )}
                      </span>
                      {coinAdjustMode === 'subtract' &&
                        editUser.coins < Math.trunc(Number(coinAdjustAmount) || 0) && (
                          <span className="ml-1 text-red-600">(not enough coins)</span>
                        )}
                    </p>
                  )}
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editVerified}
                    onChange={(e) => setEditVerified(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  Profile verified
                </label>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-900">
                    {editUser.role === 'moderator' ? 'Reset moderator password' : 'Reset password'}
                  </p>
                  <p className="mt-1 text-xs text-amber-800">
                    {editUser.role === 'moderator'
                      ? 'Set a new password to revoke the moderator’s current login. Leave blank to keep their existing password.'
                      : 'Leave blank to keep the current password.'}
                  </p>
                  <div className="mt-3 grid gap-2">
                    <Label htmlFor="edit-new-password">New password</Label>
                    <Input
                      id="edit-new-password"
                      type="password"
                      value={editNewPassword}
                      onChange={(e) => setEditNewPassword(e.target.value)}
                      autoComplete="new-password"
                      placeholder="Min 8 characters"
                    />
                    <Label htmlFor="edit-confirm-password">Confirm new password</Label>
                    <Input
                      id="edit-confirm-password"
                      type="password"
                      value={editConfirmPassword}
                      onChange={(e) => setEditConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      placeholder="Repeat new password"
                    />
                  </div>
                </div>
                </div>
              </div>
              <DialogFooter className="shrink-0 border-t border-gray-100 bg-white px-6 py-4">
                <Button type="button" variant="outline" onClick={() => setEditUser(null)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="bg-green-500 hover:bg-green-600"
                  disabled={editSaving}
                  onClick={() => void submitEdit()}
                >
                  {editSaving ? 'Saving…' : 'Save changes'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
