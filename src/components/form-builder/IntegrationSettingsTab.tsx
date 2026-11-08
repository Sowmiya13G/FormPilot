'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { ITemplateField } from '@/types';
import { HardDrive, Table, ArrowRight, ShieldCheck } from 'lucide-react';

interface IntegrationSettingsTabProps {
  fields: ITemplateField[];
  driveFolderId: string;
  spreadsheetId: string;
  sheetTabId: string;
  sheetMapping: Record<string, string>;
  onChangeDriveFolderId: (id: string) => void;
  onChangeSpreadsheetId: (id: string) => void;
  onChangeSheetTabId: (name: string) => void;
  onChangeSheetMapping: (mapping: Record<string, string>) => void;
}

export function IntegrationSettingsTab({
  fields,
  driveFolderId,
  spreadsheetId,
  sheetTabId,
  sheetMapping,
  onChangeDriveFolderId,
  onChangeSpreadsheetId,
  onChangeSheetTabId,
  onChangeSheetMapping,
}: IntegrationSettingsTabProps) {
  const handleMappingChange = (fieldKey: string, headerName: string) => {
    onChangeSheetMapping({
      ...sheetMapping,
      [fieldKey]: headerName,
    });
  };

  return (
    <div className="space-y-6">
      {/* Google Drive Configuration */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <HardDrive className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Google Drive Storage Destination
          </h3>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Event Subfolder ID
          </label>
          <input
            type="text"
            value={driveFolderId}
            onChange={(e) => onChangeDriveFolderId(e.target.value)}
            placeholder="e.g. 1a2B3c4D5e6F7g8H9i0J"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-white"
          />
          <p className="text-[11px] text-slate-400">
            Uploaded employee & spouse ID cards will be uploaded into this folder. If left blank, a folder named after this event will be created automatically under the configured root folder.
          </p>
        </div>
      </Card>

      {/* Google Sheets Configuration */}
      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Table className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Google Sheets Spreadsheet Synchronization
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Spreadsheet ID
            </label>
            <input
              type="text"
              value={spreadsheetId}
              onChange={(e) => onChangeSpreadsheetId(e.target.value)}
              placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sheet Tab Name
            </label>
            <input
              type="text"
              value={sheetTabId}
              onChange={(e) => onChangeSheetTabId(e.target.value)}
              placeholder="Registrations"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Dynamic Column Mapping Matrix */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Form Field to Sheet Header Column Mappings
            </span>
            <span className="text-[11px] text-slate-400">
              Matched strictly by header name in Row 1
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {fields.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No fields added to this form yet.
              </div>
            ) : (
              fields.map((f) => {
                const currentMapped = sheetMapping[f.fieldKey] || f.label || f.fieldKey;

                return (
                  <div
                    key={f.fieldKey}
                    className="p-3 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {f.label || f.fieldKey}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        ({f.fieldKey})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={currentMapped}
                        onChange={(e) => handleMappingChange(f.fieldKey, e.target.value)}
                        placeholder="Sheet Column Header"
                        className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white w-56 font-medium"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Values beginning with <code>=</code>, <code>+</code>, <code>-</code>, or <code>@</code> are automatically escaped with an apostrophe to prevent spreadsheet formula injection.
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default IntegrationSettingsTab;

