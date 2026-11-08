'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Send,
  Eye,
  Sliders,
  Palette,
  Table,
  Layers,
  ArrowUp,
  ArrowDown,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Settings as SettingsIcon,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import ComponentPalette from '@/components/form-builder/ComponentPalette';
import FieldConfigModal from '@/components/form-builder/FieldConfigModal';
import ThemeConfigurator from '@/components/form-builder/ThemeConfigurator';
import IntegrationSettingsTab from '@/components/form-builder/IntegrationSettingsTab';
import DynamicFormRenderer from '@/components/dynamic-form/DynamicFormRenderer';
import {
  IRegistrationTemplate,
  ITemplateField,
  IComponent,
  IThemeConfig,
} from '@/types';

interface FormBuilderProps {
  initialTemplate?: IRegistrationTemplate;
  availableComponents: IComponent[];
  isEditing?: boolean;
}

export function FormBuilder({
  initialTemplate,
  availableComponents,
  isEditing = false,
}: FormBuilderProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'fields' | 'theme' | 'integrations' | 'preview'>('fields');
  const [eventName, setEventName] = useState(initialTemplate?.eventName || '');
  const [slug, setSlug] = useState(initialTemplate?.slug || '');
  const [description, setDescription] = useState(initialTemplate?.description || '');
  const [status, setStatus] = useState(initialTemplate?.status || 'DRAFT');
  const [version, setVersion] = useState(initialTemplate?.version || 1);
  const [fields, setFields] = useState<ITemplateField[]>(initialTemplate?.fields || []);
  const [theme, setTheme] = useState<IThemeConfig>(
    initialTemplate?.theme || { primaryColor: '#2563eb', backgroundColor: '#ffffff' }
  );
  const [allowedOrigins, setAllowedOrigins] = useState<string[]>(initialTemplate?.allowedOrigins || []);
  const [driveFolderId, setDriveFolderId] = useState(initialTemplate?.driveFolderId || '');
  const [spreadsheetId, setSpreadsheetId] = useState(initialTemplate?.spreadsheetId || '');
  const [sheetTabId, setSheetTabId] = useState(initialTemplate?.sheetTabId || 'Registrations');
  const [sheetMapping, setSheetMapping] = useState<Record<string, string>>(
    initialTemplate?.sheetMapping || {}
  );

  const [configuringField, setConfiguringField] = useState<ITemplateField | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Lookup map of components by key for fast lookup
  const componentLookup = React.useMemo(() => {
    const map: Record<string, IComponent> = {};
    availableComponents.forEach((c) => {
      map[c.key] = c;
    });
    return map;
  }, [availableComponents]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleEventNameChange = (val: string) => {
    setEventName(val);
    if (!isEditing && !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleAddComponent = (comp: IComponent) => {
    // Check if fieldKey already exists
    let fieldKey = comp.key;
    let counter = 1;
    while (fields.some((f) => f.fieldKey === fieldKey)) {
      fieldKey = `${comp.key}_${counter++}`;
    }

    const newField: ITemplateField = {
      componentKey: comp.key,
      fieldKey,
      label: comp.label,
      placeholder: comp.placeholder,
      helpText: comp.helpText,
      required: comp.defaultRequired,
      order: fields.length,
      width: 'full',
    };

    setFields([...fields, newField]);
    showNotification('success', `Added field "${newField.label}" to form canvas`);
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= fields.length) return;

    const reordered = [...fields];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);

    // Update orders
    const updated = reordered.map((f, i) => ({ ...f, order: i }));
    setFields(updated);
  };

  const handleRemoveField = (fieldKey: string) => {
    const updated = fields
      .filter((f) => f.fieldKey !== fieldKey)
      .map((f, i) => ({ ...f, order: i }));
    setFields(updated);
  };

  const handleSaveFieldConfig = (updatedField: ITemplateField) => {
    setFields(fields.map((f) => (f.fieldKey === updatedField.fieldKey ? updatedField : f)));
    showNotification('success', `Updated configuration for "${updatedField.fieldKey}"`);
  };

  const handleSaveDraft = async () => {
    if (!eventName.trim() || !slug.trim()) {
      showNotification('error', 'Event Name and Unique Slug are required.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        eventName,
        slug,
        description,
        fields,
        theme,
        allowedOrigins,
        driveFolderId,
        spreadsheetId,
        sheetTabId,
        sheetMapping,
      };

      const url = isEditing ? `/api/templates/${initialTemplate?._id}` : '/api/templates';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save template');

      showNotification('success', 'Template draft saved successfully');
      if (!isEditing && data.data?._id) {
        router.push(`/registration-templates/${data.data._id}`);
      }
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!isEditing || !initialTemplate?._id) {
      showNotification('error', 'Please save the template draft first before publishing.');
      return;
    }

    if (fields.length === 0) {
      showNotification('error', 'Cannot publish a form with 0 fields.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/templates/${initialTemplate._id}/publish`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatus('PUBLISHED');
      setVersion(data.data?.version || version + 1);
      showNotification('success', 'Template published successfully! Standalone export is now active.');
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to publish');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push('/registration-templates')}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {eventName || 'Untitled Event Template'}
              </h1>
              <Badge variant={status === 'PUBLISHED' ? 'success' : 'warning'}>
                {status} (v{version})
              </Badge>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              slug: {slug || 'event-slug'} &bull; {fields.length} fields configured
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={handleSaveDraft}
            isLoading={isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handlePublish}
            disabled={isLoading || fields.length === 0}
          >
            <Send className="w-4 h-4 mr-2" />
            Publish Form
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`rounded-lg p-3.5 flex items-center gap-3 border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Basic Metadata Card */}
      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Event Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => handleEventNameChange(e.target.value)}
              placeholder="e.g. Wonderla BANDHAN 13.2"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Unique Event Slug <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              disabled={isEditing}
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="e.g. wonderla-bandhan-13-2"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Short Event Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Annual partner convention and amusement park passes"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('fields')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'fields'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Fields & Canvas ({fields.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'theme'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Theme & Branding</span>
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'integrations'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Google Workspace Sync</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'preview'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Live Form Preview</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'fields' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Canvas: Ordered Fields */}
          <div className="lg:col-span-8 space-y-3">
            {fields.length === 0 ? (
              <Card className="p-12 text-center space-y-3 border-dashed">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Form canvas is empty
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click components from the palette on the right to assemble your event registration form.
                </p>
              </Card>
            ) : (
              fields.map((field, idx) => {
                const comp = componentLookup[field.componentKey] || {};
                const hasConditions = Boolean(
                  field.conditionalConfig?.rules && field.conditionalConfig.rules.length > 0
                );

                return (
                  <Card
                    key={field.fieldKey}
                    className="p-4 flex items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </span>
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {field.label || comp.label || field.fieldKey}
                          </span>
                          {field.required && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                              Required
                            </span>
                          )}
                          {hasConditions && (
                            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 flex items-center gap-1">
                              <Sliders className="w-2.5 h-2.5" /> Conditional
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="font-mono text-[11px]">{field.fieldKey}</span>
                          <span>&bull;</span>
                          <span className="capitalize">{comp.type || 'text'}</span>
                          <span>&bull;</span>
                          <span>Width: {field.width || 'full'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Canvas Controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveField(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveField(idx, 'down')}
                        disabled={idx === fields.length - 1}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfiguringField(field)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                        title="Configure field & rules"
                      >
                        <SettingsIcon className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveField(field.fieldKey)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Remove from form"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* Right Column: Palette */}
          <div className="lg:col-span-4 sticky top-24">
            <ComponentPalette
              availableComponents={availableComponents}
              onAddComponent={handleAddComponent}
            />
          </div>
        </div>
      )}

      {activeTab === 'theme' && (
        <ThemeConfigurator
          theme={theme}
          allowedOrigins={allowedOrigins}
          onChangeTheme={setTheme}
          onChangeAllowedOrigins={setAllowedOrigins}
        />
      )}

      {activeTab === 'integrations' && (
        <IntegrationSettingsTab
          fields={fields}
          driveFolderId={driveFolderId}
          spreadsheetId={spreadsheetId}
          sheetTabId={sheetTabId}
          sheetMapping={sheetMapping}
          onChangeDriveFolderId={setDriveFolderId}
          onChangeSpreadsheetId={setSpreadsheetId}
          onChangeSheetTabId={setSheetTabId}
          onChangeSheetMapping={setSheetMapping}
        />
      )}

      {activeTab === 'preview' && (
        <div className="py-4">
          <DynamicFormRenderer
            fields={fields}
            theme={theme}
            eventName={eventName || 'Event Form Preview'}
            description={description}
            componentLookup={componentLookup}
          />
        </div>
      )}

      {/* Field Configuration & Conditional Rules Modal */}
      <FieldConfigModal
        field={configuringField}
        allFields={fields}
        isOpen={!!configuringField}
        onClose={() => setConfiguringField(null)}
        onSave={handleSaveFieldConfig}
      />
    </div>
  );
}

export default FormBuilder;

