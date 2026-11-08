'use client';

import React, { useState } from 'react';
import { X, Sliders, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import ConditionalRulesBuilder from '@/components/form-builder/ConditionalRulesBuilder';
import { ITemplateField } from '@/types';

interface FieldConfigModalProps {
  field: ITemplateField | null;
  allFields: ITemplateField[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedField: ITemplateField) => void;
}

function FieldConfigForm({
  field,
  allFields,
  onClose,
  onSave,
}: {
  field: ITemplateField;
  allFields: ITemplateField[];
  onClose: () => void;
  onSave: (updatedField: ITemplateField) => void;
}) {
  const [label, setLabel] = useState(field.label || '');
  const [placeholder, setPlaceholder] = useState(field.placeholder || '');
  const [helpText, setHelpText] = useState(field.helpText || '');
  const [required, setRequired] = useState(field.required || false);
  const [width, setWidth] = useState<'full' | 'half' | 'third'>(field.width || 'full');
  const [conditionalConfig, setConditionalConfig] = useState(field.conditionalConfig);

  const handleSave = () => {
    onSave({
      ...field,
      label: label.trim() || undefined,
      placeholder: placeholder.trim() || undefined,
      helpText: helpText.trim() || undefined,
      required,
      width,
      conditionalConfig,
    });
    onClose();
  };

  return (
    <>
      {/* Scrollable Form Body */}
      <div className="p-6 space-y-5 overflow-y-auto flex-1">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Label Override
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Leave empty to use component default label"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Placeholder Override
            </label>
            <input
              type="text"
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              placeholder="Custom placeholder..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Layout Width
            </label>
            <select
              value={width}
              onChange={(e) => setWidth(e.target.value as 'full' | 'half' | 'third')}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
            >
              <option value="full">Full Width (100%)</option>
              <option value="half">Half Width (50%)</option>
              <option value="third">One Third (33%)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Help Text Override
          </label>
          <input
            type="text"
            value={helpText}
            onChange={(e) => setHelpText(e.target.value)}
            placeholder="Custom help guidance for this event..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
          />
        </div>

        <div className="pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Make this field required for this event
            </span>
          </label>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <ConditionalRulesBuilder
            currentFieldKey={field.fieldKey}
            allFields={allFields}
            config={conditionalConfig}
            onChange={setConditionalConfig}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          <Check className="w-4 h-4 mr-1.5" /> Apply Configuration
        </Button>
      </div>
    </>
  );
}

export function FieldConfigModal({
  field,
  allFields,
  isOpen,
  onClose,
  onSave,
}: FieldConfigModalProps) {
  if (!isOpen || !field) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Configure Field: {field.fieldKey}
              </h3>
              <p className="text-xs text-slate-400">Component: {field.componentKey}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <FieldConfigForm
          key={field.fieldKey}
          field={field}
          allFields={allFields}
          onClose={onClose}
          onSave={onSave}
        />
      </div>
    </div>
  );
}

export default FieldConfigModal;
