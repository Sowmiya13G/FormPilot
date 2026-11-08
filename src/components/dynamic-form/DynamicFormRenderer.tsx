'use client';

import React, { useState } from 'react';
import { ITemplateField, IThemeConfig, IComponent } from '@/types';
import FieldRenderer from '@/components/dynamic-form/FieldRenderer';
import { isFieldVisible } from '@/components/dynamic-form/evaluateCondition';
import Card from '@/components/ui/Card';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface DynamicFormRendererProps {
  fields: ITemplateField[];
  theme?: IThemeConfig;
  eventName: string;
  slug?: string;
  templateId?: string;
  description?: string;
  componentLookup?: Record<string, IComponent>;
  onSubmitSimulation?: (values: Record<string, unknown>) => void;
}

export function DynamicFormRenderer({
  fields,
  theme = {},
  eventName,
  slug,
  templateId,
  description,
  componentLookup = {},
  onSubmitSimulation,
}: DynamicFormRendererProps) {
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedRegistrationId, setConfirmedRegistrationId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [idempotencyKey] = useState(() =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  );

  const primaryColor = theme.primaryColor || '#54258b';

  // Handle value change with conditional field clearing & mirroring
  const handleValueChange = (fieldKey: string, val: unknown) => {
    const updatedValues: Record<string, unknown> = { ...formValues, [fieldKey]: val };

    // Mirroring for Employee name and Spouse name
    if (fieldKey === 'name' || fieldKey === 'employeeName') {
      updatedValues['employeeNameDisplay'] = val;
    }
    if (fieldKey === 'spouseName') {
      updatedValues['spouseNameDisplay'] = val;
    }

    // Sync kids count when kidsCount changes
    if (fieldKey === 'kidsCount') {
      const count = Number(val) || 0;
      const existingKids = (Array.isArray(updatedValues['kidsDetails'])
        ? updatedValues['kidsDetails']
        : Array.isArray(updatedValues['kids'])
        ? updatedValues['kids']
        : []) as Array<Record<string, unknown>>;

      const newKids: Array<Record<string, unknown>> = [];
      for (let i = 0; i < count; i++) {
        newKids.push(
          existingKids[i] || {
            name: '',
            childName: '',
            age: '',
            heightEligibility: 'ABOVE 75 CM',
            ticketRequired: 'Yes',
          }
        );
      }
      updatedValues['kidsDetails'] = newKids;
      updatedValues['kids'] = newKids;
    }

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
  const employeeTicketVal = formValues['employeeTicket'] || formValues['employeeTicketRequired'];
  const calcEmployeeTickets = employeeTicketVal === 'Yes' ? 1 : 0;

  const spouseName = formValues['spouseName'];
  const hasSpouse = Boolean(spouseName && String(spouseName).trim().length > 0);
  const spouseTicketVal = formValues['spouseTicket'] || formValues['spouseTicketRequired'];
  const calcSpouseTickets = hasSpouse && spouseTicketVal === 'Yes' ? 1 : 0;

  const kidsList = (Array.isArray(formValues['kidsDetails'])
    ? formValues['kidsDetails']
    : Array.isArray(formValues['kids'])
    ? formValues['kids']
    : []) as Array<Record<string, unknown>>;

  const isBringingKids = formValues['kids'] === 'Yes' || formValues['bringingKids'] === 'Yes';
  const validKids = isBringingKids ? kidsList : [];

  const calcKidsTickets = validKids.filter((k) => k?.ticketRequired === 'Yes').length;
  const calcKidsAbove = validKids.filter((k) => k?.heightEligibility === 'ABOVE 75 CM').length;
  const calcKidsBelow = validKids.filter((k) => k?.heightEligibility === 'BELOW 75 CM').length;

  const totalTickets = calcEmployeeTickets + calcSpouseTickets + calcKidsTickets;

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (onSubmitSimulation) {
      onSubmitSimulation(formValues);
      setSubmitted(true);
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      const payload = {
        templateId,
        slug,
        idempotencyKey,
        data: {
          ...formValues,
          totalTickets,
        },
      };

      const res = await fetch('/api/public/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to submit registration');
      }

      setConfirmedRegistrationId(json.data?.registrationId || 'CONFIRMED');
      setSubmitted(true);
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      {/* Header bar matching Wonderla / Hitachi branding */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 px-2">
        <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-sm">
          {eventName}
        </h1>
        {theme.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={theme.logoUrl}
            alt="Event Logo"
            className="h-10 w-auto object-contain brightness-0 invert"
          />
        )}
      </div>

      <Card className="overflow-hidden border border-slate-200/40 dark:border-slate-800 shadow-2xl p-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl">
        <div className="p-6 sm:p-10 space-y-6">
          <div className="text-center space-y-2 border-b border-purple-100 dark:border-purple-950 pb-5">
            <h2 className="text-2xl font-bold text-[#32145e] dark:text-purple-300">
              Event Registration
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {description || 'Please fill in the details below to complete your registration.'}
            </p>
          </div>

          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Registration Confirmed!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                Thank you! Your event registration has been received and verified.
                {confirmedRegistrationId && (
                  <span className="block mt-2 font-mono text-sm font-bold text-[#54258b] dark:text-purple-400">
                    Confirmation ID: {confirmedRegistrationId}
                  </span>
                )}
                <span className="block mt-1">
                  Total Wonderla Tickets Allocated: <strong>{totalTickets}</strong>.
                </span>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {apiError && (
                <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-rose-800 dark:text-rose-200">
                    {apiError}
                  </p>
                </div>
              )}

              {/* Render Fields */}
              <div className="grid grid-cols-12 gap-5">
                {fields.map((f) => {
                  const visible = isFieldVisible(f.conditionalConfig, formValues);
                  if (!visible) return null;

                  // Custom Section divider
                  if (f.componentKey.startsWith('section')) {
                    return (
                      <div
                        key={f.fieldKey}
                        className="col-span-12 border-b border-[#e5ddef] dark:border-purple-900 pb-2 mt-3"
                      >
                        <h3 className="text-base font-bold text-[#4b267d] dark:text-purple-300">
                          {f.label}
                        </h3>
                      </div>
                    );
                  }

                  const compMeta = componentLookup[f.componentKey] || {};
                  const fieldProps: Partial<IComponent> = {
                    ...compMeta,
                    key: f.fieldKey,
                    label: f.label || compMeta.label || f.fieldKey,
                    placeholder: f.placeholder || compMeta.placeholder,
                    helpText: f.helpText || compMeta.helpText,
                    defaultRequired:
                      f.required !== undefined ? f.required : compMeta.defaultRequired,
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

              {/* Wonderla Sub-Cards for Employee and Spouse Tickets */}
              <div className="space-y-4 pt-2">
                {/* Employee Ticket Details Sub-Card */}
                <div className="rounded-xl border border-[#e5ddef] dark:border-purple-900 p-5 bg-[#faf7fe] dark:bg-purple-950/20 space-y-4">
                  <h4 className="text-sm font-bold text-[#4b267d] dark:text-purple-300">
                    Employee Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                        Employee Name
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={String(formValues['name'] || formValues['employeeName'] || '')}
                        placeholder="Mirrored from Name above"
                        className="w-full text-xs font-semibold px-3 py-2 rounded-lg bg-[#f1ecf8] dark:bg-purple-900/40 text-[#32145e] dark:text-purple-200 border border-purple-200 dark:border-purple-800 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                        Height Eligibility
                      </label>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#e7f6ec] text-[#16803c]">
                        ABOVE 75 CM
                      </span>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                        Wonderla Ticket Required? <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={String(formValues['employeeTicket'] || 'Yes')}
                        onChange={(e) => handleValueChange('employeeTicket', e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Spouse Ticket Details Sub-Card (Conditional) */}
                {hasSpouse && (
                  <div className="rounded-xl border border-[#e5ddef] dark:border-purple-900 p-5 bg-[#faf7fe] dark:bg-purple-950/20 space-y-4">
                    <h4 className="text-sm font-bold text-[#4b267d] dark:text-purple-300">
                      Spouse / Partner Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                          Spouse Name
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={String(formValues['spouseName'] || '')}
                          className="w-full text-xs font-semibold px-3 py-2 rounded-lg bg-[#f1ecf8] dark:bg-purple-900/40 text-[#32145e] dark:text-purple-200 border border-purple-200 dark:border-purple-800 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                          Height Eligibility
                        </label>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#e7f6ec] text-[#16803c]">
                          ABOVE 75 CM
                        </span>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                          Wonderla Ticket Required? <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={String(formValues['spouseTicket'] || 'Yes')}
                          onChange={(e) => handleValueChange('spouseTicket', e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Child Cards (if bringing kids) */}
              {isBringingKids && validKids.length > 0 && (
                <div className="space-y-4 pt-2">
                  <h4 className="text-sm font-bold text-[#4b267d] dark:text-purple-300">
                    Accompanying Children Details
                  </h4>
                  {validKids.map((kid, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-[#e5ddef] dark:border-purple-900 p-5 bg-[#faf7fe] dark:bg-purple-950/20 space-y-4"
                    >
                      <h5 className="text-xs font-bold text-[#4b267d] dark:text-purple-300">
                        Child {idx + 1}
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                            Kid Name *
                          </label>
                          <input
                            type="text"
                            value={String(kid.name || '')}
                            onChange={(e) => {
                              const updated = [...validKids];
                              updated[idx] = { ...updated[idx], name: e.target.value, childName: e.target.value };
                              handleValueChange('kidsDetails', updated);
                            }}
                            placeholder="Enter child name"
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                            Kid Age (0-17) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="17"
                            value={String(kid.age || '')}
                            onChange={(e) => {
                              const updated = [...validKids];
                              updated[idx] = { ...updated[idx], age: e.target.value };
                              handleValueChange('kidsDetails', updated);
                            }}
                            placeholder="Age"
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                            Height Eligibility *
                          </label>
                          <select
                            value={String(kid.heightEligibility || 'ABOVE 75 CM')}
                            onChange={(e) => {
                              const updated = [...validKids];
                              updated[idx] = { ...updated[idx], heightEligibility: e.target.value };
                              handleValueChange('kidsDetails', updated);
                            }}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          >
                            <option value="ABOVE 75 CM">ABOVE 75 CM</option>
                            <option value="BELOW 75 CM">BELOW 75 CM</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                            Ticket Required? *
                          </label>
                          <select
                            value={String(kid.ticketRequired || 'Yes')}
                            onChange={(e) => {
                              const updated = [...validKids];
                              updated[idx] = { ...updated[idx], ticketRequired: e.target.value };
                              handleValueChange('kidsDetails', updated);
                            }}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          >
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Exact Wonderla Ticket Summary Card */}
              <div className="rounded-xl border-2 border-[#60339b] overflow-hidden text-sm">
                <div className="flex justify-between items-center px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-[#eee6f6] dark:border-slate-700">
                  <span className="text-slate-700 dark:text-slate-300">Employee Ticket Required</span>
                  <strong className="text-[#32145e] dark:text-purple-300">
                    {employeeTicketVal || '—'}
                  </strong>
                </div>
                <div className="flex justify-between items-center px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-[#eee6f6] dark:border-slate-700">
                  <span className="text-slate-700 dark:text-slate-300">Spouse Ticket Required</span>
                  <strong className="text-[#32145e] dark:text-purple-300">
                    {hasSpouse ? spouseTicketVal || '—' : 'No (not attending)'}
                  </strong>
                </div>
                <div className="flex justify-between items-center px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-[#eee6f6] dark:border-slate-700">
                  <span className="text-slate-700 dark:text-slate-300">Total Number of Kids</span>
                  <strong className="text-[#32145e] dark:text-purple-300">{validKids.length}</strong>
                </div>
                <div className="flex justify-between items-center px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-[#eee6f6] dark:border-slate-700">
                  <span className="text-slate-700 dark:text-slate-300">Kids Above 75 CM</span>
                  <strong className="text-[#32145e] dark:text-purple-300">{calcKidsAbove}</strong>
                </div>
                <div className="flex justify-between items-center px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-[#eee6f6] dark:border-slate-700">
                  <span className="text-slate-700 dark:text-slate-300">Kids Below 75 CM</span>
                  <strong className="text-[#32145e] dark:text-purple-300">{calcKidsBelow}</strong>
                </div>
                <div className="flex justify-between items-center px-4 py-3 bg-[#54258b] text-white font-bold text-base">
                  <span>Total Wonderla Tickets Required</span>
                  <span className="text-xl font-extrabold">{totalTickets}</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-lg font-bold text-white shadow-lg transition-all hover:bg-[#3e176d] focus:outline-hidden cursor-pointer disabled:opacity-50 text-base"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSubmitting ? 'Submitting Registration...' : 'Submit Registration'}
                </button>
              </div>
            </form>
          )}
        </div>
      </Card>

      <footer className="text-center text-white font-semibold text-lg drop-shadow-sm pt-2">
        Thank You for Your Interest!
      </footer>
    </div>
  );
}

export default DynamicFormRenderer;
