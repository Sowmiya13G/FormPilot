'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ComponentCard from '@/components/form-builder/ComponentCard';
import { IComponent, ComponentCategory } from '@/types';
import { useToast } from '@/context/ToastContext';

interface ComponentCatalogClientProps {
  initialComponents: IComponent[];
}

const categories: ('All' | ComponentCategory)[] = [
  'All',
  'Personal Details',
  'Travel & Stay',
  'ID & Verification',
  'Family & Kids',
  'Custom',
];

export function ComponentCatalogClient({ initialComponents }: ComponentCatalogClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [components, setComponents] = useState<IComponent[]>(initialComponents);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ComponentCategory>('All');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    toast[type](message);
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const refreshComponents = async () => {
    try {
      const res = await fetch('/api/components');
      const data = await res.json();
      if (res.ok && data.success) {
        setComponents(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/components/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showNotification('success', `Component ${active ? 'activated' : 'deactivated'} successfully`);
      refreshComponents();
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to update component');
    }
  };

  const handleDuplicate = async (comp: IComponent) => {
    const newKey = `${comp.key}_copy_${Date.now().toString(36).slice(-4)}`;
    const newLabel = `${comp.label} (Copy)`;

    try {
      const res = await fetch('/api/components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...comp,
          _id: undefined,
          key: newKey,
          label: newLabel,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showNotification('success', `Component duplicated as "${newLabel}"`);
      refreshComponents();
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to duplicate component');
    }
  };

  const filtered = components.filter((c) => {
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    const q = search.toLowerCase();
    const matchesQuery =
      c.label.toLowerCase().includes(q) ||
      c.key.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Component Library
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build and manage reusable form fields with validation rules and default options.
          </p>
        </div>
        <Link href="/components/new">
          <Button variant="primary" className="font-semibold shadow-xs">
            <Plus className="w-4 h-4 mr-2" />
            Create Component
          </Button>
        </Link>
      </div>

      {/* Search & Category Filter Pills */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search components by label, key, or description..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 ${selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Components Grid */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            No components found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search || selectedCategory !== 'All'
              ? 'Try adjusting your search query or category filters.'
              : 'Get started by creating your first reusable form field component.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/components/new')}
            className="mt-2"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create Component
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((component) => (
            <ComponentCard
              key={component._id}
              component={component}
              onToggleActive={handleToggleActive}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ComponentCatalogClient;

