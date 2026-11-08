'use client';

import React from 'react';
import { IComponent } from '@/types';
import { Upload, Plus, Trash2, Info, EyeOff } from 'lucide-react';

interface FieldRendererProps {
  component: IComponent | Partial<IComponent>;
  value?: unknown;
  onChange?: (val: unknown) => void;
  error?: string;
  disabled?: boolean;
}

export function FieldRenderer({
  component,
  value,
  onChange,
  error,
  disabled = false,
}: FieldRendererProps) {
  const {
    label = 'Field Label',
    type = 'text',
    placeholder = '',
    helpText = '',
    defaultRequired = false,
    options = [],
    validationConfig = {},
  } = component;

  const renderInput = () => {
    switch (type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
      case 'date':
        return (
          <input
            type={type === 'tel' ? 'tel' : type === 'number' ? 'number' : type === 'date' ? 'date' : type === 'email' ? 'email' : 'text'}
            value={value !== undefined ? String(value) : ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder || (type === 'tel' ? '9876543210' : '')}
            disabled={disabled}
            className={`w-full rounded-lg border bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
            }`}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value !== undefined ? String(value) : ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder || 'Enter details...'}
            rows={3}
            disabled={disabled}
            className={`w-full rounded-lg border bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
            }`}
          />
        );

      case 'select':
        return (
          <select
            value={value !== undefined ? String(value) : ''}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className={`w-full rounded-lg border bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
            }`}
          >
            <option value="">{placeholder || 'Select an option'}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="flex flex-wrap gap-4 pt-1">
            {options.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <input
                  type="radio"
                  name={component.key || 'radio_preview'}
                  value={opt.value}
                  checked={String(value) === opt.value}
                  onChange={() => onChange?.(opt.value)}
                  disabled={disabled}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange?.(e.target.checked)}
              disabled={disabled}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              {placeholder || 'I agree'}
            </span>
          </label>
        );

      case 'checkbox-group':
        return (
          <div className="space-y-2 pt-1">
            {options.map((opt) => {
              const currentVals: string[] = Array.isArray(value) ? value : [];
              const isChecked = currentVals.includes(opt.value);

              return (
                <label
                  key={opt.value}
                  className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...currentVals, opt.value]
                        : currentVals.filter((v) => v !== opt.value);
                      onChange?.(next);
                    }}
                    disabled={disabled}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
        );

      case 'file':
        return (
          <div className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-5 text-center transition-colors hover:border-blue-400">
            <Upload className="mx-auto w-7 h-7 text-slate-400" />
            <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              Click or drag file to upload
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {validationConfig?.allowedFileTypes?.join(', ') || 'JPG, PNG, PDF'} (Max{' '}
              {validationConfig?.maxFileSize ? Math.round(validationConfig.maxFileSize / 1024 / 1024) : 5} MB)
            </p>
          </div>
        );

      case 'section':
        return (
          <div className="pt-3 pb-1 border-b border-slate-200 dark:border-slate-800">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">{label}</h4>
            {helpText && <p className="text-xs text-slate-500 mt-0.5">{helpText}</p>}
          </div>
        );

      case 'info':
        return (
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-semibold text-blue-900 dark:text-blue-200">{label}</span>
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                {helpText || placeholder || 'Informational notice for attendees.'}
              </p>
            </div>
          </div>
        );

      case 'hidden':
        return (
          <div className="p-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/40 text-xs text-slate-500 flex items-center gap-2">
            <EyeOff className="w-4 h-4" />
            <span>Hidden Field: <code>{component.key || 'key'}</code></span>
          </div>
        );

      case 'repeatable':
        return (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Repeatable Group Items
              </span>
              <button
                type="button"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Row
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-300">Item 1 (Attendee / Child)</span>
              <Trash2 className="w-4 h-4 text-slate-400 hover:text-rose-500 cursor-pointer" />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Special presentation for divider/info elements
  if (type === 'section' || type === 'info' || type === 'hidden') {
    return <div className="space-y-1">{renderInput()}</div>;
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {label} {defaultRequired && <span className="text-rose-500">*</span>}
        </label>
        {validationConfig?.pattern && (
          <span className="text-[10px] text-slate-400">Regex validated</span>
        )}
      </div>

      {renderInput()}

      {helpText && <p className="text-[11px] text-slate-400">{helpText}</p>}
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}

export default FieldRenderer;

