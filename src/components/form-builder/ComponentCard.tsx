'use client';

import React from 'react';
import Link from 'next/link';
import {
  Edit3,
  Copy,
  Power,
  Layers,
  FileText,
  Mail,
  Phone,
  Hash,
  Calendar,
  List,
  CheckSquare,
  Upload,
  AlignLeft,
  EyeOff,
  Users,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { IComponent, ComponentFieldType } from '@/types';

interface ComponentCardProps {
  component: IComponent;
  onToggleActive?: (id: string, active: boolean) => void;
  onDuplicate?: (component: IComponent) => void;
}

export function ComponentCard({
  component,
  onToggleActive,
  onDuplicate,
}: ComponentCardProps) {
  const getFieldIcon = (type: ComponentFieldType) => {
    switch (type) {
      case 'text':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'email':
        return <Mail className="w-4 h-4 text-indigo-500" />;
      case 'tel':
        return <Phone className="w-4 h-4 text-emerald-500" />;
      case 'number':
        return <Hash className="w-4 h-4 text-amber-500" />;
      case 'date':
        return <Calendar className="w-4 h-4 text-cyan-500" />;
      case 'select':
      case 'radio':
        return <List className="w-4 h-4 text-purple-500" />;
      case 'checkbox':
      case 'checkbox-group':
        return <CheckSquare className="w-4 h-4 text-teal-500" />;
      case 'file':
        return <Upload className="w-4 h-4 text-rose-500" />;
      case 'textarea':
        return <AlignLeft className="w-4 h-4 text-blue-400" />;
      case 'hidden':
        return <EyeOff className="w-4 h-4 text-slate-400" />;
      case 'repeatable':
        return <Users className="w-4 h-4 text-orange-500" />;
      default:
        return <Layers className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <Card className="hover:border-blue-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between p-5 space-y-4">
      <div className="space-y-3">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              {getFieldIcon(component.type)}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                {component.label}
              </h4>
              <span className="text-[11px] font-mono text-slate-400 line-clamp-1">
                {component.key}
              </span>
            </div>
          </div>
          <Badge variant={component.active ? 'success' : 'gray'}>
            {component.active ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Badges / Meta */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {component.category}
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
            {component.type}
          </span>
          {component.defaultRequired && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">
              Required
            </span>
          )}
        </div>

        {/* Description / HelpText */}
        {component.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            {component.description}
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <span className="text-[10px] text-slate-400">v{component.version}</span>
        <div className="flex items-center gap-2">
          <Link
            href={`/components/${component._id}`}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Edit Component"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </Link>
          {onDuplicate && (
            <button
              onClick={() => onDuplicate(component)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Duplicate Component"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
          {onToggleActive && (
            <button
              onClick={() => onToggleActive(component._id, !component.active)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title={component.active ? 'Deactivate' : 'Activate'}
            >
              <Power className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default ComponentCard;

