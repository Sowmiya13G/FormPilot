import { describe, it, expect } from 'vitest';
import { isFieldVisible, evaluateRule } from '@/components/dynamic-form/evaluateCondition';
import { IConditionalConfig } from '@/types';

describe('Conditional Visibility Engine', () => {
  it('should evaluate "equals" operator case-insensitively', () => {
    expect(evaluateRule({ fieldKey: 'cabRequired', operator: 'equals', value: 'Yes' }, { cabRequired: 'yes' })).toBe(true);
    expect(evaluateRule({ fieldKey: 'cabRequired', operator: 'equals', value: 'Yes' }, { cabRequired: 'No' })).toBe(false);
  });

  it('should evaluate "notEquals" operator', () => {
    expect(evaluateRule({ fieldKey: 'status', operator: 'notEquals', value: 'Draft' }, { status: 'Published' })).toBe(true);
    expect(evaluateRule({ fieldKey: 'status', operator: 'notEquals', value: 'Draft' }, { status: 'Draft' })).toBe(false);
  });

  it('should evaluate "isEmpty" and "isNotEmpty" operators', () => {
    expect(evaluateRule({ fieldKey: 'spouseName', operator: 'isEmpty' }, { spouseName: '' })).toBe(true);
    expect(evaluateRule({ fieldKey: 'spouseName', operator: 'isEmpty' }, { spouseName: 'Priya' })).toBe(false);
    expect(evaluateRule({ fieldKey: 'spouseName', operator: 'isNotEmpty' }, { spouseName: 'Priya' })).toBe(true);
    expect(evaluateRule({ fieldKey: 'spouseName', operator: 'isNotEmpty' }, { spouseName: '   ' })).toBe(false);
  });

  it('should evaluate "greaterThan" and "lessThan" operators numerically', () => {
    expect(evaluateRule({ fieldKey: 'age', operator: 'greaterThan', value: 18 }, { age: '25' })).toBe(true);
    expect(evaluateRule({ fieldKey: 'age', operator: 'greaterThan', value: 18 }, { age: 10 })).toBe(false);
    expect(evaluateRule({ fieldKey: 'age', operator: 'lessThan', value: 18 }, { age: 12 })).toBe(true);
  });

  it('should show field when matchType is "all" and all rules pass', () => {
    const config: IConditionalConfig = {
      action: 'show',
      matchType: 'all',
      rules: [
        { fieldKey: 'cabRequired', operator: 'equals', value: 'Yes' },
        { fieldKey: 'city', operator: 'equals', value: 'Bangalore' },
      ],
    };

    expect(isFieldVisible(config, { cabRequired: 'Yes', city: 'Bangalore' })).toBe(true);
    expect(isFieldVisible(config, { cabRequired: 'Yes', city: 'Kochi' })).toBe(false);
  });

  it('should show field when matchType is "any" and at least one rule passes', () => {
    const config: IConditionalConfig = {
      action: 'show',
      matchType: 'any',
      rules: [
        { fieldKey: 'department', operator: 'equals', value: 'IT' },
        { fieldKey: 'department', operator: 'equals', value: 'HR' },
      ],
    };

    expect(isFieldVisible(config, { department: 'IT' })).toBe(true);
    expect(isFieldVisible(config, { department: 'Finance' })).toBe(false);
  });

  it('should invert visibility when action is "hide"', () => {
    const config: IConditionalConfig = {
      action: 'hide',
      matchType: 'all',
      rules: [{ fieldKey: 'isRemote', operator: 'equals', value: 'Yes' }],
    };

    expect(isFieldVisible(config, { isRemote: 'Yes' })).toBe(false);
    expect(isFieldVisible(config, { isRemote: 'No' })).toBe(true);
  });
});

