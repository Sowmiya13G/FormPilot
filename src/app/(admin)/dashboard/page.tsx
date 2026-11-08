import React from 'react';
import Link from 'next/link';
import {
  FileText,
  CheckCircle2,
  ClipboardList,
  Mail,
  PlusCircle,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default async function DashboardPage() {
  // Initial placeholder KPI values (will be hydrated from database in later phases)
  const stats = [
    { name: 'Total Templates', value: '1', icon: FileText, change: 'Wonderla ready', color: 'text-blue-600' },
    { name: 'Published Templates', value: '1', icon: CheckCircle2, change: 'Live for export', color: 'text-emerald-600' },
    { name: 'Total Registrations', value: '0', icon: ClipboardList, change: 'Across all events', color: 'text-purple-600' },
    { name: 'Email Campaigns', value: '0', icon: Mail, change: 'Dispatched via Gmail', color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome & Workflow Explanation */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            FormPilot &bull; The Registration Hub
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to FormPilot</h1>
          <p className="text-blue-100 text-sm leading-relaxed">
            Eliminate manual HTML, CSS, and JS development for client events. Assemble reusable form components,
            configure dynamic conditional logic, preview in real time, and export standalone single-file HTML registration
            forms that can be hosted on any client server.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link href="/registration-templates/new">
              <Button variant="secondary" size="md" className="font-semibold shadow-xs">
                <PlusCircle className="w-4 h-4 mr-2" />
                Create New Template
              </Button>
            </Link>
            <Link href="/components">
              <Button
                variant="outline"
                size="md"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                <Layers className="w-4 h-4 mr-2" />
                Manage Components
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="hover:border-blue-200 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">{stat.name}</span>
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                  <p className="mt-1 text-xs text-slate-400">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Platform Workflow Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>How the Platform Works</CardTitle>
            <CardDescription>Four simple steps from component selection to client hosting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Choose Reusable Components</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select personal details, ID card uploads, ticket preferences, and dynamic repeatable attendee sections.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Set Rules & Conditional Logic</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure dynamic rules (e.g., if Cab = Yes show pickup address; if spouse attends require spouse ID card).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Export Standalone HTML</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Download a complete, zero-dependency HTML file with responsive styling and validation baked in.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                4
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Collect Submissions Automatically</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registrations safely ingest into MongoDB, append rows to Google Sheets, and store ID documents in Google Drive.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Direct shortcuts to platform modules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/registration-templates"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Registration Templates</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/components"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Component Catalog</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/send-email"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Send Invitation Email</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/settings"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <ClipboardList className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Integrations & Settings</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

