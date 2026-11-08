import { IConditionalConfig, IConditionRule } from '@/types';

export function evaluateConditionRule(
  rule: IConditionRule,
  formValues: Record<string, unknown>
): boolean {
  const actualValue = formValues[rule.fieldKey];

  switch (rule.operator) {
    case 'equals':
      return String(actualValue ?? '').trim().toLowerCase() === String(rule.value ?? '').trim().toLowerCase();

    case 'notEquals':
      return String(actualValue ?? '').trim().toLowerCase() !== String(rule.value ?? '').trim().toLowerCase();

    case 'isEmpty':
      return actualValue === undefined || actualValue === null || String(actualValue).trim() === '';

    case 'isNotEmpty':
      return actualValue !== undefined && actualValue !== null && String(actualValue).trim() !== '';

    case 'greaterThan':
      return Number(actualValue) > Number(rule.value);

    case 'lessThan':
      return Number(actualValue) < Number(rule.value);

    case 'contains':
      if (Array.isArray(actualValue)) {
        return actualValue.includes(rule.value);
      }
      return String(actualValue ?? '').includes(String(rule.value ?? ''));

    default:
      return true;
  }
}

export const evaluateRule = evaluateConditionRule;

export function isFieldVisible(
  config: IConditionalConfig | undefined,
  formValues: Record<string, unknown>
): boolean {
  if (!config || !config.rules || config.rules.length === 0) {
    return true;
  }

  const matches = config.rules.map((rule) => evaluateConditionRule(rule, formValues));
  const isMatch = config.matchType === 'any' ? matches.some(Boolean) : matches.every(Boolean);

  return config.action === 'show' ? isMatch : !isMatch;
}

export default isFieldVisible;

