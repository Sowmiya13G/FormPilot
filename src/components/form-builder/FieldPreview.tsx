'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import FieldRenderer from '@/components/dynamic-form/FieldRenderer';
import { IComponent } from '@/types';

interface FieldPreviewProps {
  component: Partial<IComponent>;
}

export function FieldPreview({ component }: FieldPreviewProps) {
  const [value, setValue] = useState<unknown>(component.defaultValue || '');

  return (
    <Card className="h-full flex flex-col shadow-xs border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Interactive Preview
          </span>
          <Badge variant="purple">{component.type || 'text'}</Badge>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          key: {component.key || 'field_key'}
        </span>
      </div>

      <div className="flex-1 py-6 flex flex-col justify-center">
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <FieldRenderer
            component={component}
            value={value}
            onChange={(val) => setValue(val)}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Test typing or clicking inside the preview above.</span>
        <span>Category: {component.category || 'Custom'}</span>
      </div>
    </Card>
  );
}

export default FieldPreview;
