'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Plus, Trash2, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ValidationConfigForm from '@/components/form-builder/ValidationConfigForm';
import FieldPreview from '@/components/form-builder/FieldPreview';
import { IComponent, ComponentFieldType, ComponentCategory, ISelectOption } from '@/types';
import { useToast } from '@/context/ToastContext';

interface ComponentEditorProps {
  initialData?: IComponent;
  isEditing?: boolean;
}

export function ComponentEditor({ initialData, isEditing = false }: ComponentEditorProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [label, setLabel] = useState(initialData?.label || '');
  const [key, setKey] = useState(initialData?.key || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [type, setType] = useState<ComponentFieldType>(initialData?.type || 'text');
  const [category, setCategory] = useState<ComponentCategory>(initialData?.category || 'Custom');
  const [placeholder, setPlaceholder] = useState(initialData?.placeholder || '');
  const [helpText, setHelpText] = useState(initialData?.helpText || '');
  const [defaultRequired, setDefaultRequired] = useState(initialData?.defaultRequired || false);
  const [options, setOptions] = useState<ISelectOption[]>(
    initialData?.options || [
      { label: 'Option 1', value: 'Option 1' },
      { label: 'Option 2', value: 'Option 2' },
    ]
  );
  const [validationConfig, setValidationConfig] = useState(initialData?.validationConfig || {});

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate key from label if new component and key hasn't been manually altered
  const handleLabelChange = (val: string) => {
    setLabel(val);
    if (!isEditing && !key) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      setKey(generated);
    }
  };

  const handleAddOption = () => {
    const nextIdx = options.length + 1;
    setOptions([...options, { label: `Option ${nextIdx}`, value: `Option ${nextIdx}` }]);
  };

  const handleUpdateOption = (index: number, field: 'label' | 'value', val: string) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: val };
    setOptions(updated);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const hasOptions = type === 'select' || type === 'radio' || type === 'checkbox-group';

  const previewComponent: Partial<IComponent> = {
    key: key || 'field_key',
    label: label || 'Field Label',
    type,
    category,
    placeholder,
    helpText,
    defaultRequired,
    options: hasOptions ? options : undefined,
    validationConfig,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const payload = {
      key,
      label,
      description: description.trim() || undefined,
      type,
      category,
      placeholder: placeholder.trim() || undefined,
      helpText: helpText.trim() || undefined,
      defaultRequired,
      options: hasOptions ? options : undefined,
      validationConfig,
    };

    try {
      const url = isEditing ? `/api/components/${initialData?._id}` : '/api/components';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save component');
      }

      toast.success(isEditing ? 'Component updated successfully!' : 'Component created successfully!');
      router.push('/components');
      router.refresh();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push('/components')}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isEditing ? `Edit Component: ${initialData?.label}` : 'Create Reusable Component'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure field type, default validations, and options.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/components')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Component
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-800 dark:text-rose-300 font-medium">{error}</p>
        </div>
      )}

      {/* Two Column Layout: Editor & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Configuration */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Basic Field Settings
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Label <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  placeholder="e.g. Employee Mobile Number"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Field Key <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={isEditing}
                  value={key}
                  onChange={(e) => setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  placeholder="e.g. mobileNumber"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Field Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ComponentFieldType)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text">Text (Single-line)</option>
                  <option value="email">Email</option>
                  <option value="tel">Mobile / Tel</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="select">Dropdown Select</option>
                  <option value="radio">Radio Group</option>
                  <option value="checkbox">Single Checkbox</option>
                  <option value="checkbox-group">Checkbox Group (Multi-select)</option>
                  <option value="textarea">Textarea (Multi-line)</option>
                  <option value="file">File Upload (ID documents)</option>
                  <option value="hidden">Hidden Metadata</option>
                  <option value="section">Section Heading Divider</option>
                  <option value="info">Informational Instructions</option>
                  <option value="repeatable">Repeatable Group (Kids/Attendees)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ComponentCategory)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Personal Details">Personal Details</option>
                  <option value="Travel & Stay">Travel & Stay</option>
                  <option value="ID & Verification">ID & Verification</option>
                  <option value="Family & Kids">Family & Kids</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Placeholder Text
                </label>
                <input
                  type="text"
                  value={placeholder}
                  onChange={(e) => setPlaceholder(e.target.value)}
                  placeholder="e.g. Enter your Indian mobile number"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Help / Tooltip Text
                </label>
                <input
                  type="text"
                  value={helpText}
                  onChange={(e) => setHelpText(e.target.value)}
                  placeholder="e.g. 10 digits starting with 6, 7, 8, or 9"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief internal note about this component..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={defaultRequired}
                  onChange={(e) => setDefaultRequired(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Required field by default
                </span>
              </label>
            </div>
          </Card>

          {/* Options Manager (if select, radio, or checkbox-group) */}
          {hasOptions && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Dropdown / Choice Options
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Option
                </Button>
              </div>

              <div className="space-y-2.5">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={opt.label}
                      onChange={(e) => handleUpdateOption(idx, 'label', e.target.value)}
                      placeholder={`Option ${idx + 1} Label`}
                      className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={opt.value}
                      onChange={(e) => handleUpdateOption(idx, 'value', e.target.value)}
                      placeholder={`Option ${idx + 1} Value`}
                      className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      disabled={options.length <= 1}
                      className="text-slate-400 hover:text-rose-500 p-1.5 rounded disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Validation Settings Sub-editor */}
          <Card className="p-6 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Validation Rules
            </h3>
            <ValidationConfigForm
              type={type}
              config={validationConfig}
              onChange={setValidationConfig}
            />
          </Card>
        </div>

        {/* Right Column: Interactive Live Preview Sticky Card */}
        <div className="lg:col-span-5 sticky top-24">
          <FieldPreview component={previewComponent} />
        </div>
      </div>
    </div>
  );
}

export default ComponentEditor;
