'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface SidebarContextValue {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapse: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
  setIsCollapsed: (val: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsedState] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const pathname = usePathname();

  // Load user preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('formpilot_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsedState(saved === 'true');
      }
    } catch {
      // Safe ignore in private mode or SSR
    }
  }, []);

  // Automatically close mobile menu when navigating to a new route
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsedState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('formpilot_sidebar_collapsed', String(next));
      } catch {
        // Safe ignore
      }
      return next;
    });
  }, []);

  const setIsCollapsed = useCallback((val: boolean) => {
    setIsCollapsedState(val);
    try {
      localStorage.setItem('formpilot_sidebar_collapsed', String(val));
    } catch {
      // Safe ignore
    }
  }, []);

  const toggleMobile = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        isMobileOpen,
        toggleCollapse,
        toggleMobile,
        closeMobile,
        setIsCollapsed,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    return {
      isCollapsed: false,
      isMobileOpen: false,
      toggleCollapse: () => {},
      toggleMobile: () => {},
      closeMobile: () => {},
      setIsCollapsed: () => {},
    };
  }
  return context;
}

