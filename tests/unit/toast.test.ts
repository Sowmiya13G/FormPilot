import { describe, it, expect } from 'vitest';
import { useToast } from '@/context/ToastContext';

describe('Global Toast System', () => {
  it('should provide safe fallback toast methods outside provider', () => {
    const { toast, showToast } = useToast();
    expect(typeof showToast).toBe('function');
    expect(typeof toast.success).toBe('function');
    expect(typeof toast.error).toBe('function');
    expect(typeof toast.info).toBe('function');

    expect(() => {
      toast.success('Registration submitted successfully!');
      toast.error('Mobile number is invalid');
      toast.info('Please wait...');
      showToast('Custom notification', 'success');
    }).not.toThrow();
  });
});

