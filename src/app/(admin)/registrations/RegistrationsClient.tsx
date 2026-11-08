'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Copy,
  Check,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { IRegistration, SyncStatus } from '@/types';

interface RegistrationsClientProps {
  initialRegistrations: IRegistration[];
  initialTotal: number;
  distinctEvents: string[];
}

export function RegistrationsClient({
  initialRegistrations,
  initialTotal,
  distinctEvents,
}: RegistrationsClientProps) {
  const [registrations, setRegistrations] = useState<IRegistration[]>(initialRegistrations);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSheetsSync, setSelectedSheetsSync] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<IRegistration | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchRegistrations = async (newPage: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(newPage));
      params.set('limit', '20');
      if (search.trim()) params.set('search', search.trim());
      if (selectedEvent !== 'All') params.set('eventName', selectedEvent);
      if (selectedStatus !== 'All') params.set('status', selectedStatus);
      if (selectedSheetsSync !== 'All') params.set('sheetsSyncStatus', selectedSheetsSync);

      const res = await fetch(`/api/registrations?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch registrations');
      const data = await res.json();
      setRegistrations(data.registrations || []);
      setTotal(data.pagination?.total || 0);
      setPage(newPage);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRegistrations(1);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSyncBadge = (status: SyncStatus) => {
    switch (status) {
      case 'SYNCED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            Synced
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertTriangle className="w-3 h-3" />
            Failed
          </span>
        );
      case 'SKIPPED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Skipped
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Incoming Registrations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time public registrations, automated ticket calculations, and sync status tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="default" className="px-3 py-1 font-mono text-xs">
            {total} Total Registrations
          </Badge>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, Name, Email, Mobile..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedEvent}
              onChange={(e) => {
                setSelectedEvent(e.target.value);
                setTimeout(() => fetchRegistrations(1), 0);
              }}
              className="w-full py-2 px-3 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Events</option>
              {distinctEvents.map((evt) => (
                <option key={evt} value={evt}>
                  {evt}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedSheetsSync}
              onChange={(e) => {
                setSelectedSheetsSync(e.target.value);
                setTimeout(() => fetchRegistrations(1), 0);
              }}
              className="w-full py-2 px-3 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Sync Status</option>
              <option value="SYNCED">Sheets: Synced</option>
              <option value="PENDING">Sheets: Pending</option>
              <option value="FAILED">Sheets: Failed</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setTimeout(() => fetchRegistrations(1), 0);
              }}
              className="w-full py-2 px-3 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <Button type="submit" variant="primary" size="md" className="w-full" isLoading={isLoading}>
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </Card>

      {/* Registrations Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-5 py-3.5">Registration ID</th>
                <th className="px-5 py-3.5">Event</th>
                <th className="px-5 py-3.5">Attendee</th>
                <th className="px-5 py-3.5 text-center">Tickets</th>
                <th className="px-5 py-3.5">Sheets Sync</th>
                <th className="px-5 py-3.5">Drive Sync</th>
                <th className="px-5 py-3.5">Submitted</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No registrations found matching your query.
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => {
                  const attendeeName =
                    String(reg.data?.employeeName || reg.data?.name || 'Attendee');
                  const attendeeEmail = String(reg.data?.email || '-');
                  const attendeePhone = String(
                    reg.data?.contactNumber || reg.data?.mobile || ''
                  );

                  return (
                    <tr
                      key={reg.registrationId}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap font-mono text-xs font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <span>{reg.registrationId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyId(reg.registrationId)}
                            className="text-slate-400 hover:text-blue-600 transition"
                            title="Copy ID"
                          >
                            {copiedId === reg.registrationId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                        {reg.eventName}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {attendeeName}
                        </div>
                        <div className="text-xs text-slate-400">
                          {attendeeEmail} {attendeePhone && `• ${attendeePhone}`}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <span
                          className="inline-flex items-center justify-center font-bold px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                          title={`Employee: ${reg.ticketSummary?.employeeTickets || 0}, Spouse: ${reg.ticketSummary?.spouseTickets || 0}, Kids: ${reg.ticketSummary?.kidsTickets || 0}`}
                        >
                          {reg.ticketSummary?.totalTickets ?? 1} Tickets
                        </span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {getSyncBadge(reg.sheetsSyncStatus)}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {getSyncBadge(reg.driveSyncStatus)}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500">
                        {new Date(reg.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRegistration(reg)}
                          className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                          title="View Full Details"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {total > 20 && (
          <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing page {page} of {Math.ceil(total / 20)} ({total} registrations)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => fetchRegistrations(page - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page * 20 >= total || isLoading}
                onClick={() => fetchRegistrations(page + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Registration Details Modal / Drawer */}
      {selectedRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl max-h-[90vh] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            {/* Topbar */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  Registration Details
                </span>
                <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                  {selectedRegistration.registrationId}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRegistration(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Event & Summary Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-medium text-slate-400 block">Event Name</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedRegistration.eventName}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-400 block">Status</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {selectedRegistration.status}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-400 block">Submitted At</span>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    {new Date(selectedRegistration.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Ticket Breakdown Card */}
              <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  Verified Ticket Allocation ({selectedRegistration.ticketSummary?.totalTickets || 1} Total)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-[11px] text-slate-400 block">Employee</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedRegistration.ticketSummary?.employeeTickets || 0}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-[11px] text-slate-400 block">Spouse</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedRegistration.ticketSummary?.spouseTickets || 0}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-[11px] text-slate-400 block">Kids</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedRegistration.ticketSummary?.kidsTickets || 0}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-[11px] text-slate-400 block">&gt; 75cm</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedRegistration.ticketSummary?.kidsAbove75cm || 0}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-[11px] text-slate-400 block">&lt; 75cm</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedRegistration.ticketSummary?.kidsBelow75cm || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submitted Form Answers */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Submitted Answers
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(selectedRegistration.data || {}).map(([key, val]) => {
                    if (key === 'kids') return null; // rendered separately below
                    return (
                      <div
                        key={key}
                        className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40"
                      >
                        <span className="text-[11px] font-mono font-medium text-slate-400 uppercase block">
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

              {/* Children Attendees List if any */}
              {Array.isArray(selectedRegistration.data?.kids) &&
                (selectedRegistration.data.kids as Array<Record<string, unknown>>).length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Children Attendees
                    </h4>
                    <div className="space-y-2">
                      {(
                        selectedRegistration.data.kids as Array<Record<string, unknown>>
                      ).map((kid, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between"
                        >
                          <div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white block">
                              {String(kid.childName || `Child ${idx + 1}`)}
                            </span>
                            <span className="text-xs text-slate-500">
                              Age: {String(kid.age)} years &bull; Height:{' '}
                              {String(kid.heightEligibility)}
                            </span>
                          </div>
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              kid.ticketRequired === 'Yes'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            Ticket: {String(kid.ticketRequired)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Uploaded Files if any */}
              {selectedRegistration.files && selectedRegistration.files.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Attached Documents ({selectedRegistration.files.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedRegistration.files.map((f, idx) => (
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
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-3.5 bg-slate-50 dark:bg-slate-900 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedRegistration(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistrationsClient;
