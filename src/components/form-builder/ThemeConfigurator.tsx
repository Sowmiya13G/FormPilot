'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { IThemeConfig } from '@/types';
import { Palette, Globe, Image as ImageIcon } from 'lucide-react';

interface ThemeConfiguratorProps {
  theme: IThemeConfig;
  allowedOrigins: string[];
  onChangeTheme: (theme: IThemeConfig) => void;
  onChangeAllowedOrigins: (origins: string[]) => void;
}

export function ThemeConfigurator({
  theme,
  allowedOrigins,
  onChangeTheme,
  onChangeAllowedOrigins,
}: ThemeConfiguratorProps) {
  const updateThemeField = (key: keyof IThemeConfig, value: string) => {
    onChangeTheme({
      ...theme,
      [key]: value,
    });
  };

  const handleOriginsChange = (text: string) => {
    const list = text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    onChangeAllowedOrigins(list);
  };

  return (
    <div className="space-y-6">
      {/* Branding & Visual Theme */}
      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Palette className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Branding & Visual Styling
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Primary Theme Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.primaryColor || '#2563eb'}
                onChange={(e) => updateThemeField('primaryColor', e.target.value)}
                className="w-10 h-10 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
              />
              <input
                type="text"
                value={theme.primaryColor || '#2563eb'}
                onChange={(e) => updateThemeField('primaryColor', e.target.value)}
                placeholder="#2563eb"
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Page Background Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.backgroundColor || '#ffffff'}
                onChange={(e) => updateThemeField('backgroundColor', e.target.value)}
                className="w-10 h-10 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
              />
              <input
                type="text"
                value={theme.backgroundColor || '#ffffff'}
                onChange={(e) => updateThemeField('backgroundColor', e.target.value)}
                placeholder="#ffffff"
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Header Banner Image URL
          </label>
          <input
            type="url"
            value={theme.bannerImageUrl || ''}
            onChange={(e) => updateThemeField('bannerImageUrl', e.target.value)}
            placeholder="https://client-domain.com/images/wonderla-banner.jpg"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
          />
          <p className="text-[11px] text-slate-400">
            Displayed prominently at the top of the standalone registration form.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Background Image URL (Optional)
          </label>
          <input
            type="url"
            value={theme.backgroundImageUrl || ''}
            onChange={(e) => updateThemeField('backgroundImageUrl', e.target.value)}
            placeholder="https://client-domain.com/images/resort-bg.jpg"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
          />
        </div>

        {/* Visual Banner Preview */}
        {theme.bannerImageUrl && (
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Banner Preview:
            </span>
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-48 bg-slate-100 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={theme.bannerImageUrl}
                alt="Banner preview"
                className="w-full h-auto max-h-48 object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs pointer-events-none">
                <ImageIcon className="w-5 h-5 mr-1.5" /> Image loaded
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Allowed Origins (CORS Security) */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Globe className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Client Website Origins (CORS Protection)
          </h3>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Allowed Hosting Domains
          </label>
          <textarea
            rows={3}
            value={allowedOrigins.join('\n')}
            onChange={(e) => handleOriginsChange(e.target.value)}
            placeholder="https://client-site.com&#10;https://events.wonderla.com"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          <p className="text-[11px] text-slate-400">
            Enter one domain per line (including protocol). Only submissions originating from these domains will be accepted. Leave blank to allow any origin in development.
          </p>
        </div>
      </Card>
    </div>
  );
}

export default ThemeConfigurator;

