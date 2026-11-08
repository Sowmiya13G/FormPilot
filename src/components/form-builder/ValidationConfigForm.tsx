'use client';

import React from 'react';
import { ComponentFieldType, IValidationConfig } from '@/types';

interface ValidationConfigFormProps {
  type: ComponentFieldType;
  config: IValidationConfig;
  onChange: (config: IValidationConfig) => void;
}

export function ValidationConfigForm({ type, config, onChange }: ValidationConfigFormProps) {
  const updateField = (key: keyof IValidationConfig, value: unknown) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  const isTextLike = type === 'text' || type === 'email' || type === 'tel' || type === 'textarea';
  const isNumeric = type === 'number';
  const isFile = type === 'file';

  if (!isTextLike && !isNumeric && !isFile) {
    return (
      <div className="text-xs text-slate-400 py-2">
        No specific validation rules required for field type &quot;{type}&quot;.
      </div>
    );
  }

  const allFileExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.docx', '.xlsx'];
  const currentFileTypes = config.allowedFileTypes || ['.jpg', '.jpeg', '.png', '.pdf'];

  return (
    <div className="space-y-4 pt-2">
      {isTextLike && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Min Length
              </label>
              <input
                type="number"
                min={0}
                value={config.minLength !== undefined ? config.minLength : ''}
                onChange={(e) =>
                  updateField('minLength', e.target.value ? parseInt(e.target.value, 10) : undefined)
                }
                placeholder="e.g. 2"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Max Length
              </label>
              <input
                type="number"
                min={1}
                value={config.maxLength !== undefined ? config.maxLength : ''}
                onChange={(e) =>
                  updateField('maxLength', e.target.value ? parseInt(e.target.value, 10) : undefined)
                }
                placeholder="e.g. 100"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Regex Pattern
            </label>
            <input
              type="text"
              value={config.pattern || ''}
              onChange={(e) => updateField('pattern', e.target.value || undefined)}
              placeholder="e.g. ^[6-9]\d{9}$ for Indian mobile"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Regex Error Message
            </label>
            <input
              type="text"
              value={config.patternMessage || ''}
              onChange={(e) => updateField('patternMessage', e.target.value || undefined)}
              placeholder="e.g. Please enter a valid 10-digit Indian mobile number"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
            />
          </div>
        </>
      )}

      {isNumeric && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Minimum Value
            </label>
            <input
              type="number"
              value={config.minValue !== undefined ? config.minValue : ''}
              onChange={(e) =>
                updateField('minValue', e.target.value ? parseFloat(e.target.value) : undefined)
              }
              placeholder="e.g. 0"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Maximum Value
            </label>
            <input
              type="number"
              value={config.maxValue !== undefined ? config.maxValue : ''}
              onChange={(e) =>
                updateField('maxValue', e.target.value ? parseFloat(e.target.value) : undefined)
              }
              placeholder="e.g. 17"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {isFile && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Maximum File Size (MB)
            </label>
            <input
              type="number"
              min={1}
              max={25}
              value={config.maxFileSize ? Math.round(config.maxFileSize / 1024 / 1024) : 5}
              onChange={(e) => {
                const mb = parseInt(e.target.value, 10) || 5;
                updateField('maxFileSize', mb * 1024 * 1024);
              }}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Allowed File Extensions
            </label>
            <div className="grid grid-cols-3 gap-2">
              {allFileExtensions.map((ext) => {
                const isSelected = currentFileTypes.includes(ext);
                return (
                  <label
                    key={ext}
                    className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...currentFileTypes, ext]
                          : currentFileTypes.filter((t) => t !== ext);
                        updateField('allowedFileTypes', next);
                      }}
                      className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{ext}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ValidationConfigForm;

