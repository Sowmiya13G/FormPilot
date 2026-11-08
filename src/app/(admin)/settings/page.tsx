import React, { Suspense } from 'react';
import connectDB from '@/lib/db/mongoose';
import SystemSetting from '@/models/SystemSetting';
import Integration from '@/models/Integration';
import AuditLog, { IAuditLogDocument } from '@/models/AuditLog';
import SettingsClient from './SettingsClient';

async function SettingsDataLoader() {
  await connectDB();

  const [settingsList, rawIntegration, rawAuditLogs] = await Promise.all([
    SystemSetting.find({}).lean(),
    Integration.findOne({ provider: 'GOOGLE_WORKSPACE' }).lean(),
    AuditLog.find({}).sort({ timestamp: -1 }).limit(50).lean(),
  ]);

  const settingsMap: Record<string, unknown> = {};
  for (const item of settingsList) {
    settingsMap[item.key] = item.value;
  }

  const integration = rawIntegration
    ? {
        provider: rawIntegration.provider,
        ownerEmail: rawIntegration.ownerEmail,
        status: rawIntegration.status,
        lastTestedAt: rawIntegration.lastTestedAt?.toISOString(),
        lastTestResult: rawIntegration.lastTestResult,
        config: rawIntegration.config,
      }
    : null;

  const auditLogs: IAuditLogDocument[] = JSON.parse(JSON.stringify(rawAuditLogs));

  return (
    <SettingsClient
      initialSettings={settingsMap}
      initialIntegration={integration}
      initialAuditLogs={auditLogs}
    />
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      }
    >
      <SettingsDataLoader />
    </Suspense>
  );
}

