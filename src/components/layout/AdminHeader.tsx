'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useSidebar } from '@/context/SidebarContext';

const routeTitleMap: Record<string, string> = {
  '/dashboard': 'Dashboard Overview',
  '/registration-templates': 'Registration Templates',
  '/components': 'Component Library',
  '/registrations': 'Registration Submissions',
  '/send-email': 'Email Campaign Composer',
  '/users': 'User Management & Roles',
  '/settings': 'Platform & Workspace Settings',
};

export function AdminHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse, toggleMobile } = useSidebar();

  const user = session?.user || {
    name: 'Wonderla Administrator',
    email: 'admin@wonderla.com',
    role: 'ADMIN' as const,
  };

  const roleVariantMap = {
    ADMIN: 'purple' as const,
    EDITOR: 'default' as const,
    VIEWER: 'gray' as const,
  };

  const role = (user.role || 'ADMIN') as keyof typeof roleVariantMap;

  // Resolve current title
  const currentTitle =
    Object.entries(routeTitleMap).find(([route]) =>
      route === '/dashboard' ? pathname === route : pathname?.startsWith(route)
    )?.[1] || 'Registration Hub';

  return (
    <header className="h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-colors">
      <div className="flex items-center gap-3.5">
        {/* Mobile Hamburger Drawer Toggle */}
        <button
          type="button"
          onClick={toggleMobile}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-hidden transition-colors"
          aria-label="Toggle navigation drawer"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Breadcrumb Title */}
        <div className="flex items-center gap-2">
          <span className="text-lg sm:text-xl font-medium tracking-wide text-slate-800 dark:text-slate-200 opacity-75">
            {currentTitle}
          </span>
        </div>
      </div>

      {/* Right Controls: User Profile & Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            {'image' in user && user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name || 'User'}
                className="w-8 h-8 rounded-full border border-purple-300 dark:border-purple-700 object-cover ring-2 ring-purple-500/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {(user.name || user.email || 'A')[0].toUpperCase()}
              </div>
            )}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                {user.name || user.email}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                {user.email}
              </span>
            </div>
          </div>

          <Badge variant={roleVariantMap[role] || 'purple'}>
            {role}
          </Badge>

          {session && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 p-2 rounded-lg"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
