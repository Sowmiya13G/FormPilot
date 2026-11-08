import React, { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, FileText, Users, ExternalLink } from 'lucide-react';
import connectDB from '@/lib/db/mongoose';
import Registration from '@/models/Registration';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { IRegistration, SyncStatus } from '@/types';

async function RegistrationDetailLoader({
  params,
}: {
  params: Promise<{ registrationId: string }>;
}) {
  const { registrationId } = await params;
  await connectDB();

  const rawRegistration = await Registration.findOne({
    $or: [
      { registrationId },
      { _id: registrationId.match(/^[0-9a-fA-F]{24}$/) ? registrationId : null },
    ],
  }).lean();

  if (!rawRegistration) {
    notFound();
  }

  const reg: IRegistration = JSON.parse(JSON.stringify(rawRegistration));

  const getSyncBadge = (status: SyncStatus) => {
    switch (status) {
      case 'SYNCED':
        return <Badge variant="success">Synced</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      case 'FAILED':
        return <Badge variant="danger">Failed</Badge>;
      case 'SKIPPED':
        return <Badge variant="gray">Skipped</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/registrations"
          className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Registrations
        </Link>
        <span className="font-mono text-xs text-slate-400">
          ID: {reg.registrationId}
        </span>
      </div>

      {/* Main Overview Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {reg.eventName}
            </h1>
            <p className="text-sm font-mono text-blue-600 dark:text-blue-400 mt-0.5">
              {reg.registrationId}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Status:</span>
            <Badge variant="success">{reg.status}</Badge>
          </div>
        </div>

        {/* Sync Status Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">
              Google Sheets Sync
            </span>
            {getSyncBadge(reg.sheetsSyncStatus)}
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">
              Google Drive Sync
            </span>
            {getSyncBadge(reg.driveSyncStatus)}
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">
              Registered Date
            </span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {new Date(reg.createdAt).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Ticket Summary Section */}
        <div className="py-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            Verified Ticket Summary ({reg.ticketSummary?.totalTickets || 1} Total)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <span className="text-xs text-slate-400 block">Employee</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {reg.ticketSummary?.employeeTickets || 0}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <span className="text-xs text-slate-400 block">Spouse</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {reg.ticketSummary?.spouseTickets || 0}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <span className="text-xs text-slate-400 block">Kids</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {reg.ticketSummary?.kidsTickets || 0}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <span className="text-xs text-slate-400 block">&gt; 75cm</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {reg.ticketSummary?.kidsAbove75cm || 0}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <span className="text-xs text-slate-400 block">&lt; 75cm</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {reg.ticketSummary?.kidsBelow75cm || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Answers Map */}
        <div className="py-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Form Submissions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(reg.data || {}).map(([key, val]) => {
              if (key === 'kids') return null;
              return (
                <div
                  key={key}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40"
                >
                  <span className="text-[11px] font-mono text-slate-400 uppercase block">
                    {key}
                  </span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {val !== undefined && val !== null ? String(val) : '-'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Children details if any */}
        {Array.isArray(reg.data?.kids) &&
          (reg.data.kids as Array<Record<string, unknown>>).length > 0 && (
            <div className="py-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Children Details
              </h3>
              <div className="space-y-2">
                {(reg.data.kids as Array<Record<string, unknown>>).map((kid, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white block">
                        {String(kid.childName || `Child ${idx + 1}`)}
                      </span>
                      <span className="text-xs text-slate-500">
                        Age: {String(kid.age)} years &bull; Height: {String(kid.heightEligibility)}
                      </span>
                    </div>
                    <Badge variant={kid.ticketRequired === 'Yes' ? 'success' : 'gray'}>
                      Ticket: {String(kid.ticketRequired)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Attached Files */}
        {reg.files && reg.files.length > 0 && (
          <div className="pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Attached Files
            </h3>
            <div className="space-y-2">
              {reg.files.map((f, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                        {f.originalFilename}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Field: {f.fieldKey} &bull; {(f.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                  {f.driveViewUrl ? (
                    <a
                      href={f.driveViewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      View in Drive <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-amber-600 font-medium">
                      Pending Drive Sync
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function RegistrationDetailPage({
  params,
}: {
  params: Promise<{ registrationId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      }
    >
      <RegistrationDetailLoader params={params} />
    </Suspense>
  );
}
