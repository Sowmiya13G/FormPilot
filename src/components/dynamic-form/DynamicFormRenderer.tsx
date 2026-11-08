'use client';

import React, { useState } from 'react';
import { ITemplateField, IThemeConfig, IComponent } from '@/types';
import FieldRenderer from '@/components/dynamic-form/FieldRenderer';
import { isFieldVisible } from '@/components/dynamic-form/evaluateCondition';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { CheckCircle2, AlertCircle, Ticket } from 'lucide-react';

interface DynamicFormRendererProps {
  fields: ITemplateField[];
  theme?: IThemeConfig;
  eventName: string;
  description?: string;
  componentLookup?: Record<string, IComponent>;
  onSubmitSimulation?: (values: Record<string, unknown>) => void;
}

export function DynamicFormRenderer({
  fields,
  theme = {},
  eventName,
  description,
  componentLookup = {},
  onSubmitSimulation,
}: DynamicFormRendererProps) {
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Handle value change with conditional field clearing
  const handleValueChange = (fieldKey: string, val: unknown) => {
    const updatedValues = { ...formValues, [fieldKey]: val };

    // Clear values of any fields that become conditionally hidden
    fields.forEach((f) => {
      const visible = isFieldVisible(f.conditionalConfig, updatedValues);
      if (!visible && updatedValues[f.fieldKey] !== undefined) {
        delete updatedValues[f.fieldKey];
      }
    });

    setFormValues(updatedValues);

    // Clear error on edit
    if (errors[fieldKey]) {
      const nextErr = { ...errors };
      delete nextErr[fieldKey];
      setErrors(nextErr);
    }
  };

  // Ticket Calculation Logic
  const calcEmployeeTickets = formValues['employeeTicketRequired'] === 'Yes' ? 1 : 0;
  const hasSpouse = Boolean(formValues['spouseName'] && String(formValues['spouseName']).trim().length > 0);
  const calcSpouseTickets = hasSpouse && formValues['spouseTicketRequired'] === 'Yes' ? 1 : 0;

  let calcKidsTickets = 0;
  if (formValues['bringingKids'] === 'Yes') {
    // If kids array exists or default count
    const kids = formValues['kids'];
    if (Array.isArray(kids)) {
      calcKidsTickets = kids.filter((k) => k?.ticketRequired === 'Yes').length;
    }
  }

  const totalTickets = calcEmployeeTickets + calcSpouseTickets + calcKidsTickets;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    fields.forEach((f) => {
      const visible = isFieldVisible(f.conditionalConfig, formValues);
      if (visible && f.required) {
        const v = formValues[f.fieldKey];
        if (v === undefined || v === null || String(v).trim() === '') {
          newErrors[f.fieldKey] = `${f.label || f.fieldKey} is required`;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitted(true);
    onSubmitSimulation?.(formValues);
  };

  const primaryColor = theme.primaryColor || '#2563eb';

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6">
      {/* Container simulating client webpage hosting */}
      <Card
        className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg p-0"
        style={{ backgroundColor: theme.backgroundColor || '#ffffff' }}
      >
        {/* Banner */}
        {theme.bannerImageUrl && (
          <div className="w-full max-h-52 overflow-hidden bg-slate-100 dark:bg-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={theme.bannerImageUrl}
              alt={eventName}
              className="w-full h-auto object-cover max-h-52"
            />
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Title & Description */}
          <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{eventName}</h2>
            {description && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
            )}
          </div>

          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Registration Received!
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Thank you! Your event registration has been submitted successfully. Total Tickets Booked: <strong>{totalTickets}</strong>.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubmitted(false);
                  setFormValues({});
                }}
              >
                Submit Another Registration
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {Object.keys(errors).length > 0 && (
                <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-800 dark:text-rose-200">
                      Please fix the following required fields:
                    </h4>
                    <ul className="text-xs text-rose-700 dark:text-rose-300 list-disc list-inside mt-1 space-y-0.5">
                      {Object.values(errors).map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Render Fields with Width Grid */}
              <div className="grid grid-cols-12 gap-5">
                {fields.map((f) => {
                  const visible = isFieldVisible(f.conditionalConfig, formValues);
                  if (!visible) return null;

                  const compMeta = componentLookup[f.componentKey] || {};
                  const fieldProps: Partial<IComponent> = {
                    ...compMeta,
                    key: f.fieldKey,
                    label: f.label || compMeta.label || f.fieldKey,
                    placeholder: f.placeholder || compMeta.placeholder,
                    helpText: f.helpText || compMeta.helpText,
                    defaultRequired: f.required !== undefined ? f.required : compMeta.defaultRequired,
                  };

                  const colSpan =
                    f.width === 'half'
                      ? 'col-span-12 sm:col-span-6'
                      : f.width === 'third'
                      ? 'col-span-12 sm:col-span-4'
                      : 'col-span-12';

                  return (
                    <div key={f.fieldKey} className={colSpan}>
                      <FieldRenderer
                        component={fieldProps}
                        value={formValues[f.fieldKey]}
                        onChange={(val) => handleValueChange(f.fieldKey, val)}
                        error={errors[f.fieldKey]}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Live Ticket Summary Widget */}
              {fields.some((f) => f.fieldKey.toLowerCase().includes('ticket')) && (
                <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Ticket className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                        Total Wonderla Tickets
                      </span>
                      <p className="text-[11px] text-blue-700 dark:text-blue-300">
                        Employee ({calcEmployeeTickets}) + Spouse ({calcSpouseTickets}) + Kids ({calcKidsTickets})
                      </p>
                    </div>
                  </div>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {totalTickets}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl font-bold text-white shadow-md transition-opacity hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-blue-300 cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  Submit Registration
                </button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}

export default DynamicFormRenderer;

