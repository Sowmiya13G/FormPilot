'use client';

import React, { useState } from 'react';
import { Plus, Search, Layers } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { IComponent } from '@/types';

interface ComponentPaletteProps {
  availableComponents: IComponent[];
  onAddComponent: (component: IComponent) => void;
}

export function ComponentPalette({
  availableComponents,
  onAddComponent,
}: ComponentPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Personal Details',
    'Travel & Stay',
    'ID & Verification',
    'Family & Kids',
    'Custom',
  ];

  const filtered = availableComponents.filter((c) => {
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    const q = search.toLowerCase();
    const matchesQ =
      c.label.toLowerCase().includes(q) ||
      c.key.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q);
    return matchesCat && matchesQ && c.active;
  });

  return (
    <Card className="p-4 space-y-4 flex flex-col h-[750px]">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <Layers className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Component Palette
        </h3>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search fields to add..."
          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-[10px] px-2.5 py-1 rounded-full font-medium transition-colors shrink-0 ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Component Items List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No components match your search.
          </div>
        ) : (
          filtered.map((comp) => (
            <div
              key={comp._id}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-blue-300 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {comp.label}
                  </span>
                  {comp.defaultRequired && (
                    <span className="text-rose-500 text-xs font-bold">*</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400 truncate">
                    {comp.key}
                  </span>
                  <Badge variant="gray" className="text-[9px] py-0 px-1.5">
                    {comp.type}
                  </Badge>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onAddComponent(comp)}
                className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors shrink-0"
                title="Add to form"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

export default ComponentPalette;

