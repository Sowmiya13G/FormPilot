'use client';

import React from 'react';
import { Plus, Trash2, GitBranch } from 'lucide-react';
import Button from '@/components/ui/Button';
import { IConditionalConfig, IConditionRule, ITemplateField, ConditionOperator } from '@/types';

interface ConditionalRulesBuilderProps {
  currentFieldKey: string;
  allFields: ITemplateField[];
  config?: IConditionalConfig;
  onChange: (config: IConditionalConfig) => void;
}

export function ConditionalRulesBuilder({
  currentFieldKey,
  allFields,
  config = { action: 'show', matchType: 'all', rules: [] },
  onChange,
}: ConditionalRulesBuilderProps) {
  // Candidate fields that can be depended on (exclude current field to prevent circular dependency)
  const candidateFields = allFields.filter((f) => f.fieldKey !== currentFieldKey);

  const handleActionChange = (action: 'show' | 'hide') => {
    onChange({ ...config, action });
  };

  const handleMatchTypeChange = (matchType: 'all' | 'any') => {
    onChange({ ...config, matchType });
  };

  const handleAddRule = () => {
    const defaultField = candidateFields[0]?.fieldKey || '';
    const newRule: IConditionRule = {
      fieldKey: defaultField,
      operator: 'equals',
      value: 'Yes',
    };
    onChange({
      ...config,
      rules: [...config.rules, newRule],
    });
  };

  const handleUpdateRule = (index: number, key: keyof IConditionRule, val: unknown) => {
    const updated = [...config.rules];
    updated[index] = { ...updated[index], [key]: val };
    onChange({ ...config, rules: updated });
  };

  const handleRemoveRule = (index: number) => {
    onChange({
      ...config,
      rules: config.rules.filter((_, i) => i !== index),
    });
  };

  if (candidateFields.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 text-center">
        Add at least one other field to the template before setting conditional display rules.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <GitBranch className="w-4 h-4 text-purple-500" />
        <span>Conditional Display Logic</span>
      </div>

      {/* Action & Match Type Selectors */}
      <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-500">Action</label>
          <select
            value={config.action}
            onChange={(e) => handleActionChange(e.target.value as 'show' | 'hide')}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
          >
            <option value="show">Show this field</option>
            <option value="hide">Hide this field</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-500">Condition Match</label>
          <select
            value={config.matchType}
            onChange={(e) => handleMatchTypeChange(e.target.value as 'all' | 'any')}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
          >
            <option value="all">When ALL conditions match (AND)</option>
            <option value="any">When ANY condition matches (OR)</option>
          </select>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-2.5">
        {config.rules.map((rule, idx) => {
          const isUnaryOperator = rule.operator === 'isEmpty' || rule.operator === 'isNotEmpty';

          return (
            <div
              key={idx}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80"
            >
              {/* Field Key */}
              <select
                value={rule.fieldKey}
                onChange={(e) => handleUpdateRule(idx, 'fieldKey', e.target.value)}
                className="w-1/3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-900 dark:text-white"
              >
                {candidateFields.map((f) => (
                  <option key={f.fieldKey} value={f.fieldKey}>
                    {f.label || f.fieldKey}
                  </option>
                ))}
              </select>

              {/* Operator */}
              <select
                value={rule.operator}
                onChange={(e) =>
                  handleUpdateRule(idx, 'operator', e.target.value as ConditionOperator)
                }
                className="w-1/3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-900 dark:text-white"
              >
                <option value="equals">Equals</option>
                <option value="notEquals">Does not equal</option>
                <option value="isEmpty">Is empty</option>
                <option value="isNotEmpty">Is not empty</option>
                <option value="greaterThan">Greater than</option>
                <option value="lessThan">Less than</option>
                <option value="contains">Contains</option>
              </select>

              {/* Value Input (hidden for unary operators) */}
              {!isUnaryOperator ? (
                <input
                  type="text"
                  value={rule.value !== undefined ? String(rule.value) : ''}
                  onChange={(e) => handleUpdateRule(idx, 'value', e.target.value)}
                  placeholder="Value (e.g. Yes)"
                  className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-900 dark:text-white"
                />
              ) : (
                <div className="flex-1 text-[11px] text-slate-400 italic px-2">
                  (No value needed)
                </div>
              )}

              {/* Delete Rule */}
              <button
                type="button"
                onClick={() => handleRemoveRule(idx)}
                className="text-slate-400 hover:text-rose-500 p-1 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddRule}
          className="text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Rule
        </Button>

        {config.rules.length > 0 && (
          <button
            type="button"
            onClick={() => onChange({ ...config, rules: [] })}
            className="text-[11px] text-slate-400 hover:text-rose-500 underline"
          >
            Clear all rules
          </button>
        )}
      </div>
    </div>
  );
}

export default ConditionalRulesBuilder;

