'use client';

import React, { useState } from 'react';
import { X, Download, Smartphone, Monitor, ExternalLink } from 'lucide-react';

interface StandalonePreviewModalProps {
  templateId: string;
  slug: string;
  isOpen: boolean;
  onClose: () => void;
}

export function StandalonePreviewModal({
  templateId,
  slug,
  isOpen,
  onClose,
}: StandalonePreviewModalProps) {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');

  if (!isOpen) return null;

  const exportUrl = `/api/templates/${templateId}/export`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-5xl h-[92vh] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Modal Topbar */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-3.5 bg-slate-50 dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Standalone HTML Preview
            </span>
            <span className="text-xs font-mono text-slate-400">({slug})</span>
          </div>

          {/* Viewport Toggles & Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setViewport('desktop')}
                className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  viewport === 'desktop'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>

              <button
                type="button"
                onClick={() => setViewport('mobile')}
                className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  viewport === 'mobile'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Mobile View (375px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            <a
              href={exportUrl}
              download={`${slug}-registration.html`}
              className="inline-flex items-center justify-center font-medium rounded-lg text-xs px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download HTML
            </a>

            <a
              href={`/register/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Open direct hosted link in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Iframe Preview Container */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-6 overflow-auto flex items-center justify-center">
          <div
            className={`h-full transition-all duration-300 rounded-xl overflow-hidden shadow-md bg-white ${
              viewport === 'mobile' ? 'w-[375px] border-8 border-slate-800' : 'w-full'
            }`}
          >
            <iframe
              src={exportUrl}
              title="Standalone Form Simulation"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StandalonePreviewModal;
