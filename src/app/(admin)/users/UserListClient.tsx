'use client';

import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  MoreVertical,
  Shield,
  Trash2,
  Power,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import InviteUserModal from '@/components/users/InviteUserModal';
import EditUserRoleModal from '@/components/users/EditUserRoleModal';
import { IUser } from '@/types';

interface UserListClientProps {
  initialUsers: IUser[];
}

export function UserListClient({ initialUsers }: UserListClientProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const currentUserEmail = session?.user?.email;

  const [users, setUsers] = useState<IUser[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const refreshUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.data);
      }
    } catch (e) {
      console.error('Failed to refresh users:', e);
    }
  };

  const handleToggleStatus = async (user: IUser) => {
    if (user._id === currentUserId || user.email === currentUserEmail) {
      showNotification('error', 'You cannot deactivate your own account.');
      return;
    }

    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !user.active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showNotification('success', `User ${!user.active ? 'activated' : 'deactivated'} successfully`);
      refreshUsers();
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setActiveMenuId(null);
    }
  };

  const handleDeleteUser = async (user: IUser) => {
    if (user._id === currentUserId || user.email === currentUserEmail) {
      showNotification('error', 'You cannot delete your own account.');
      return;
    }

    if (!confirm(`Are you sure you want to remove authorized access for ${user.email}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showNotification('success', 'User removed successfully');
      refreshUsers();
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setActiveMenuId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q);
  });

  const roleBadgeMap = {
    ADMIN: 'purple' as const,
    EDITOR: 'default' as const,
    VIEWER: 'gray' as const,
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Authorized Users
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage administrative Google accounts and assign granular permissions.
          </p>
        </div>
        <Button onClick={() => setIsInviteOpen(true)} className="shrink-0 font-medium">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Authorized User
        </Button>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`rounded-lg p-3.5 flex items-center gap-3 border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email, or role..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card className="p-0 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Last Login</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No authorized users match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrent = user._id === currentUserId || user.email === currentUserEmail;

                  return (
                    <tr
                      key={user._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={user.image}
                              alt={user.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                              <UserIcon className="w-4 h-4" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                              {user.name}
                              {isCurrent && (
                                <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                                  You
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-slate-500">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant={roleBadgeMap[user.role] || 'gray'}>
                          {user.role}
                        </Badge>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                            user.active
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.active ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {user.active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500">
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Never logged in'}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() =>
                              setActiveMenuId(activeMenuId === user._id ? null : user._id)
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === user._id && (
                            <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg py-1.5 z-20">
                              <button
                                onClick={() => {
                                  setEditingUser(user);
                                  setActiveMenuId(null);
                                }}
                                disabled={isCurrent}
                                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 disabled:opacity-40"
                              >
                                <Shield className="w-3.5 h-3.5 text-purple-500" />
                                Change Role
                              </button>

                              <button
                                onClick={() => handleToggleStatus(user)}
                                disabled={isCurrent}
                                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 disabled:opacity-40"
                              >
                                <Power className="w-3.5 h-3.5 text-amber-500" />
                                {user.active ? 'Deactivate' : 'Activate'}
                              </button>

                              <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                              <button
                                onClick={() => handleDeleteUser(user)}
                                disabled={isCurrent}
                                className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 disabled:opacity-40"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Remove Access
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modals */}
      <InviteUserModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={() => {
          showNotification('success', 'User added successfully to allowlist');
          refreshUsers();
        }}
      />

      <EditUserRoleModal
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSuccess={() => {
          showNotification('success', 'User role updated successfully');
          refreshUsers();
        }}
      />
    </div>
  );
}

export default UserListClient;

