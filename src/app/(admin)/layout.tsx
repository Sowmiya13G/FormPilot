import React, { Suspense } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import { SidebarProvider } from '@/context/SidebarContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-purple-500/20 selection:text-purple-700 dark:selection:text-purple-300">
        {/* Dynamic Adjustable Sidebar Menu */}
        <Suspense
          fallback={
            <aside className="hidden md:block w-64 bg-slate-900 border-r border-slate-800 shrink-0 h-screen sticky top-0" />
          }
        >
          <AdminSidebar />
        </Suspense>

        {/* Main Content Area with Sticky Header */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
          <AdminHeader />
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
