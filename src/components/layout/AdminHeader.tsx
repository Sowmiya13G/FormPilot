'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, User as UserIcon } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export function AdminHeader() {
  const { data: session } = useSession();
  const user = session?.user;

  const roleVariantMap = {
    ADMIN: 'purple' as const,
    EDITOR: 'default' as const,
    VIEWER: 'gray' as const,
  };

  const role = (user?.role || 'VIEWER') as keyof typeof roleVariantMap;

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Placeholder for page breadcrumbs or mobile toggle */}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name || 'User'}
                  className="w-8 h-8 rounded-full border border-gray-200 dark:border-slate-700 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium text-gray-900 dark:text-slate-100 leading-tight">
                  {user.name || user.email}
                </span>
                <span className="text-xs text-gray-500 dark:text-slate-400 leading-tight">
                  {user.email}
                </span>
              </div>
            </div>

            <Badge variant={roleVariantMap[role] || 'gray'}>
              {role}
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-gray-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Badge variant="gray">Guest</Badge>
          </div>
        )}
      </div>
    </header>
  );
}

export default AdminHeader;

