'use client';

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  HardDrive,
  Table,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Activity,
  Key,
  Globe,
  RefreshCw,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { IAuditLogDocument } from '@/models/AuditLog';

interface SettingsClientProps {
  initialSettings: Record<string, unknown>;
  initialIntegration: {
    provider?: string;
    ownerEmail?: string;
    status?: string;
    lastTestedAt?: string;
    lastTestResult?: {
      success?: boolean;
      message?: string;
      services?: {
        drive?: boolean;
        sheets?: boolean;
        gmail?: boolean;
      };
    };
    config?: {
      rootDriveFolderId?: string;
      defaultSpreadsheetId?: string;
      defaultSenderEmail?: string;
    };
  } | null;
  initialAuditLogs: IAuditLogDocument[];
}

export function SettingsClient({
  initialSettings,
  initialIntegration,
  initialAuditLogs,
}: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<'integrations' | 'defaults' | 'audit'>('integrations');

  // Integrations state
  const [integration, setIntegration] = useState(initialIntegration);
  const [rootDriveFolderId, setRootDriveFolderId] = useState(
    initialIntegration?.config?.rootDriveFolderId || ''
  );
  const [defaultSpreadsheetId, setDefaultSpreadsheetId] = useState(
    initialIntegration?.config?.defaultSpreadsheetId || ''
  );
  const [defaultSenderEmail, setDefaultSenderEmail] = useState(
    initialIntegration?.config?.defaultSenderEmail || ''
  );

  // Platform defaults state
  const [publicApiUrl, setPublicApiUrl] = useState(
    String(initialSettings['PUBLIC_API_URL'] || 'http://localhost:3000')
  );
  const [uploadMaxMb, setUploadMaxMb] = useState(
    Number(initialSettings['UPLOAD_MAX_MB'] || 5)
  );
  const [allowedFileTypes, setAllowedFileTypes] = useState(
    String(initialSettings['ALLOWED_FILE_TYPES'] || 'image/jpeg, image/png, application/pdf')
  );
  const [emailSignature, setEmailSignature] = useState(
    String(
      initialSettings['EMAIL_SIGNATURE'] ||
        '<p>Warm regards,<br /><strong>Wonderla Event Organizing Team</strong><br />Wonderla Holidays Ltd.</p>'
    )
  );

  // Testing & Notification state
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [testingService, setTestingService] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleTestService = async (service: 'drive' | 'sheets' | 'gmail' | 'all') => {
    setTestingService(service);
    try {
      const res = await fetch(`/api/integrations/google/test?service=${service}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spreadsheetId: defaultSpreadsheetId }),
      });
      const data = await res.json();

      if (service === 'all') {
        setTestResults({
          drive: data.services?.drive || { success: false, message: 'Test failed' },
          sheets: data.services?.sheets || { success: false, message: 'Test failed' },
          gmail: data.services?.gmail || { success: false, message: 'Test failed' },
        });
        showNotification(
          data.success ? 'success' : 'error',
          data.success
            ? 'All Google Workspace APIs are connected and working properly.'
            : 'One or more Google Workspace services encountered an error.'
        );
      } else {
        setTestResults((prev) => ({
          ...prev,
          [service]: data,
        }));
        showNotification(data.success ? 'success' : 'error', data.message);
      }

      // Update integration state if returned
      if (data.email && integration) {
        setIntegration({
          ...integration,
          status: 'CONNECTED',
          ownerEmail: data.email,
        });
      }
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Diagnostic test failed');
    } finally {
      setTestingService(null);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            PUBLIC_API_URL: publicApiUrl,
            UPLOAD_MAX_MB: uploadMaxMb,
            ALLOWED_FILE_TYPES: allowedFileTypes,
            EMAIL_SIGNATURE: emailSignature,
          },
          googleConfig: {
            rootDriveFolderId,
            defaultSpreadsheetId,
            defaultSenderEmail,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showNotification('success', 'Configuration settings saved successfully.');
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-blue-600" />
            Platform Settings & Integrations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure Google Workspace credentials, Drive & Sheets storage locations, global defaults, and inspect audit logs.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleSaveSettings}
          isLoading={isSaving}
          className="font-bold shadow-xs"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`rounded-xl p-4 flex items-center gap-3 border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('integrations')}
          className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'integrations'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Key className="w-4 h-4" />
          Google Workspace Integrations
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('defaults')}
          className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'defaults'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Globe className="w-4 h-4" />
          Platform Defaults & Branding
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Activity className="w-4 h-4" />
          Audit Logs
        </button>
      </div>

      {/* Tab 1: Google Workspace Integrations */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          {/* Main Account Connection Card */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Google Workspace Connection Status
                    </h3>
                    <Badge variant={integration?.status === 'CONNECTED' ? 'success' : 'warning'}>
                      {integration?.status || 'DISCONNECTED'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {integration?.ownerEmail
                      ? `Connected as: ${integration.ownerEmail} (Offline access with AES-256-GCM encrypted tokens)`
                      : 'Not connected. Connect your Google account to enable Drive file uploads, Google Sheets synchronization, and Gmail campaign dispatching.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestService('all')}
                  isLoading={testingService === 'all'}
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Test All Services
                </Button>

                <a
                  href="/api/integrations/google/connect"
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
                >
                  <Key className="w-3.5 h-3.5 mr-1.5" />
                  {integration?.status === 'CONNECTED' ? 'Reconnect Google Account' : 'Connect Google Workspace'}
                </a>
              </div>
            </div>
          </Card>

          {/* Three Service Configuration Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Google Drive Card */}
            <Card className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Google Drive</h4>
                  </div>
                  {testResults.drive && (
                    <Badge variant={testResults.drive.success ? 'success' : 'danger'}>
                      {testResults.drive.success ? 'Online' : 'Error'}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Root Drive Folder ID
                  </label>
                  <input
                    type="text"
                    value={rootDriveFolderId}
                    onChange={(e) => setRootDriveFolderId(e.target.value)}
                    placeholder="e.g. 1a2B3c4D5e6F7g8H9i0J"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    Event folders will be created inside this folder.
                  </span>
                </div>

                {testResults.drive && (
                  <p className="text-[11px] p-2 rounded bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                    {testResults.drive.message}
                  </p>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestService('drive')}
                isLoading={testingService === 'drive'}
                className="w-full text-xs font-semibold"
              >
                Test Drive API
              </Button>
            </Card>

            {/* 2. Google Sheets Card */}
            <Card className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Google Sheets</h4>
                  </div>
                  {testResults.sheets && (
                    <Badge variant={testResults.sheets.success ? 'success' : 'danger'}>
                      {testResults.sheets.success ? 'Online' : 'Error'}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Default Spreadsheet ID
                  </label>
                  <input
                    type="text"
                    value={defaultSpreadsheetId}
                    onChange={(e) => setDefaultSpreadsheetId(e.target.value)}
                    placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs..."
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    Fallback sheet when templates do not specify one.
                  </span>
                </div>

                {testResults.sheets && (
                  <p className="text-[11px] p-2 rounded bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                    {testResults.sheets.message}
                  </p>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestService('sheets')}
                isLoading={testingService === 'sheets'}
                className="w-full text-xs font-semibold"
              >
                Test Sheets API
              </Button>
            </Card>

            {/* 3. Gmail API Card */}
            <Card className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-rose-600" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Gmail API</h4>
                  </div>
                  {testResults.gmail && (
                    <Badge variant={testResults.gmail.success ? 'success' : 'danger'}>
                      {testResults.gmail.success ? 'Online' : 'Error'}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Default Sender Email
                  </label>
                  <input
                    type="email"
                    value={defaultSenderEmail}
                    onChange={(e) => setDefaultSenderEmail(e.target.value)}
                    placeholder="e.g. events@wonderla.com"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    Campaigns will be sent via this authorized mailbox.
                  </span>
                </div>

                {testResults.gmail && (
                  <p className="text-[11px] p-2 rounded bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                    {testResults.gmail.message}
                  </p>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestService('gmail')}
                isLoading={testingService === 'gmail'}
                className="w-full text-xs font-semibold"
              >
                Test Gmail API
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Platform Defaults */}
      {activeTab === 'defaults' && (
        <Card className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Public Platform API Base URL
              </label>
              <input
                type="url"
                value={publicApiUrl}
                onChange={(e) => setPublicApiUrl(e.target.value)}
                placeholder="http://localhost:3000"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400 block">
                Embedded inside generated standalone HTML forms for submission dispatch.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Max Upload File Size (MB)
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={uploadMaxMb}
                onChange={(e) => setUploadMaxMb(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400 block">
                Standard cap is 5 MB per document to prevent exceeding Google Drive limits.
              </span>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Allowed File MIME Types
              </label>
              <input
                type="text"
                value={allowedFileTypes}
                onChange={(e) => setAllowedFileTypes(e.target.value)}
                placeholder="image/jpeg, image/png, application/pdf"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Global Email Campaign Signature (HTML)
              </label>
              <textarea
                rows={4}
                value={emailSignature}
                onChange={(e) => setEmailSignature(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="primary" size="md" onClick={handleSaveSettings} isLoading={isSaving}>
              Save Default Settings
            </Button>
          </div>
        </Card>
      )}

      {/* Tab 3: Audit Logs */}
      {activeTab === 'audit' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Administrative Audit Trail
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {initialAuditLogs.length} recent activity events
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {initialAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  initialAuditLogs.map((log) => (
                    <tr key={String(log._id)} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        {log.actor}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-blue-600">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 uppercase text-[11px] text-slate-500 font-medium">
                        {log.resourceType}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                        {log.resourceId}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export default SettingsClient;

