'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 5000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: useCallback(
      (message: string, duration?: number) => showToast(message, 'success', duration),
      [showToast]
    ),
    error: useCallback(
      (message: string, duration?: number) => showToast(message, 'error', duration),
      [showToast]
    ),
    info: useCallback(
      (message: string, duration?: number) => showToast(message, 'info', duration),
      [showToast]
    ),
  };

  return (
    <ToastContext.Provider value={{ showToast, toast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed top-5 right-5 z-99999 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] pointer-events-none"
      >
        {toasts.map((t) => {
          const isError = t.type === 'error';
          const isSuccess = t.type === 'success';

          return (
            <div
              key={t.id}
              role={isError ? 'alert' : 'status'}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl text-white transition-all transform duration-300 ease-out animate-in slide-in-from-top-4 fade-in ${
                isSuccess
                  ? 'bg-[#16803c]'
                  : isError
                  ? 'bg-[#c62828]'
                  : 'bg-[#32145e]'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-white" />}
                {isError && <AlertCircle className="w-5 h-5 text-white" />}
                {!isSuccess && !isError && <Info className="w-5 h-5 text-white" />}
              </div>

              <div className="flex-1 text-sm font-medium leading-snug break-words">
                {t.message}
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="shrink-0 text-white/80 hover:text-white p-0.5 rounded-md hover:bg-black/10 transition-colors cursor-pointer"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  let context: ToastContextValue | undefined;
  try {
    context = useContext(ToastContext);
  } catch {
    context = undefined;
  }

  if (!context) {
    // Fallback safe dummy if used outside of ToastProvider (e.g. isolated test)
    return {
      showToast: (message: string) => {
        if (typeof window !== 'undefined') console.log('[Toast]', message);
      },
      toast: {
        success: (message: string) => {
          if (typeof window !== 'undefined') console.log('[Toast Success]', message);
        },
        error: (message: string) => {
          if (typeof window !== 'undefined') console.error('[Toast Error]', message);
        },
        info: (message: string) => {
          if (typeof window !== 'undefined') console.info('[Toast Info]', message);
        },
      },
    };
  }
  return context;
}
