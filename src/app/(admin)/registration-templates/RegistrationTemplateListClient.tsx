'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  FileText,
  Edit3,
  Send,
  Eye,
  Archive,
  Layers,
  CheckCircle2,
  AlertCircle,
  Download,
  Globe,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { IRegistrationTemplate, TemplateStatus } from '@/types';

interface RegistrationTemplateListClientProps {
  initialTemplates: IRegistrationTemplate[];
}

export function RegistrationTemplateListClient({
  initialTemplates,
}: RegistrationTemplateListClientProps) {
  const router = useRouter();
  const [templates, setTemplates] = useState<IRegistrationTemplate[]>(initialTemplates);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TemplateStatus>('All');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const refreshTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      if (res.ok && data.success) {
        setTemplates(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePublishToggle = async (t: IRegistrationTemplate) => {
    const isPublishing = t.status === 'DRAFT';
    const action = isPublishing ? 'publish' : 'unpublish';

    try {
      const res = await fetch(`/api/templates/${t._id}/${action}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showNotification('success', isPublishing ? 'Template published!' : 'Template reverted to draft');
      refreshTemplates();
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Action failed');
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this template?')) return;

    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showNotification('success', 'Template archived successfully');
      refreshTemplates();
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to archive');
    }
  };

  const filtered = templates.filter((t) => {
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const q = search.toLowerCase();
    const matchesQ =
      t.eventName.toLowerCase().includes(q) ||
      t.slug.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q));
    return matchesStatus && matchesQ;
  });

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Registration Templates
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build, customize, and publish dynamic event registration forms with conditional logic.
          </p>
        </div>
        <Link href="/registration-templates/new">
          <Button variant="primary" className="font-semibold shadow-xs">
            <Plus className="w-4 h-4 mr-2" />
            Create New Template
          </Button>
        </Link>
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

      {/* Search & Status Filters */}
      <Card className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates by event name, slug, or description..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['All', 'DRAFT', 'PUBLISHED', 'ARCHIVED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </Card>

      {/* Templates Table / Grid */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center space-y-3 border-dashed">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            No registration templates found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search || statusFilter !== 'All'
              ? 'Try adjusting your search query or filters.'
              : 'Create your first event form template using reusable fields from the component library.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/registration-templates/new')}
            className="mt-2"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create Template
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((template) => {
            const isPublished = template.status === 'PUBLISHED';

            return (
              <Card
                key={template._id}
                className="hover:border-blue-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between p-5 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                        {template.eventName}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-400 block">
                        /{template.slug}
                      </span>
                    </div>

                    <Badge variant={isPublished ? 'success' : 'warning'}>
                      {template.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      <Layers className="w-3 h-3 text-blue-600" />
                      {template.fields?.length || 0} fields
                    </span>
                    <span className="font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      v{template.version}
                    </span>
                    {template.spreadsheetId && (
                      <span className="font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                        Sheets linked
                      </span>
                    )}
                  </div>

                  {template.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Link
                    href={`/registration-templates/${template._id}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Open Builder
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePublishToggle(template)}
                      className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isPublished
                          ? 'text-amber-600 hover:bg-amber-50'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={isPublished ? 'Revert to draft' : 'Publish template'}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>

                    <Link
                      href={`/registration-templates/${template._id}?tab=preview`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Preview Form in Builder"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>

                    <a
                      href={`/api/templates/${template._id}/export`}
                      download={`${template.slug}.html`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Download Standalone HTML"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>

                    {isPublished && (
                      <Link
                        href={`/register/${template.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Open Live Public Registration Page"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => handleArchive(template._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Archive template"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RegistrationTemplateListClient;

