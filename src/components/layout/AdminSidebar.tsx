'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Layers,
  Mail,
  Users as UsersIcon,
  Settings as SettingsIcon,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useSidebar } from '@/context/SidebarContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Registration Templates', href: '/registration-templates', icon: FileText },
  { name: 'Components', href: '/components', icon: Layers },
  { name: 'Registrations', href: '/registrations', icon: ClipboardList },
  { name: 'Send Email', href: '/send-email', icon: Mail },
  { name: 'Users', href: '/users', icon: UsersIcon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } = useSidebar();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900/95 backdrop-blur-xl text-slate-200 border-r border-slate-800/80 shadow-2xl relative select-none">
      {/* Brand Header */}
      <div
        className={clsx(
          'h-16 flex items-center border-b border-slate-800/80 transition-all duration-300',
          isCollapsed ? 'justify-center px-2' : 'justify-between px-5'
        )}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group focus:outline-hidden"
          title="FormPilot — The Registration Hub"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform duration-200">
            FP
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-white text-base tracking-tight leading-tight flex items-center gap-1.5">
                FormPilot
              </span>
              <span className="text-[11px] text-slate-400 font-medium">The Registration Hub</span>
            </div>
          )}
        </Link>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={closeMobile}
          className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60"
          aria-label="Close navigation drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={clsx(
                'group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200 focus:outline-hidden',
                isCollapsed
                  ? 'justify-center p-3'
                  : 'gap-3 px-3.5 py-2.5',
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-900/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              )}
            >
              <Icon
                className={clsx(
                  'w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-300'
                )}
              />

              {!isCollapsed && (
                <span className="truncate flex-1 tracking-tight">{item.name}</span>
              )}

              {/* Floating Tooltip when Collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl border border-slate-700 pointer-events-none opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer / Collapse Toggle */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <button
          type="button"
          onClick={toggleCollapse}
          className={clsx(
            'w-full flex items-center rounded-xl py-2 px-3 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer focus:outline-hidden',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
          title={isCollapsed ? 'Expand menu' : 'Collapse menu'}
        >
          {!isCollapsed && (
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Collapse Sidebar</span>
            </span>
          )}
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-purple-400 hover:scale-110 transition-transform" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {!isCollapsed && (
          <div className="px-3 pt-2 text-[10px] text-slate-500 font-mono tracking-tight text-center">
            FormPilot v0.1.0 &bull; Wonderla Edition
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={clsx(
          'hidden md:flex flex-col shrink-0 h-screen sticky top-0 overflow-hidden transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={closeMobile}
          />
          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

export default AdminSidebar;
