'use client';

import React, { useState } from 'react';
import {
  Mail,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { IRegistrationTemplate } from '@/types';
import { IEmailCampaignDocument } from '@/models/EmailCampaign';
import { useToast } from '@/context/ToastContext';

interface EmailComposerClientProps {
  templates: IRegistrationTemplate[];
  initialCampaigns: IEmailCampaignDocument[];
  siteUrl: string;
}

export function EmailComposerClient({
  templates,
  initialCampaigns,
  siteUrl,
}: EmailComposerClientProps) {
  const { toast } = useToast();
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?._id || '');
  const [subject, setSubject] = useState(
    templates[0] ? `Invitation: ${templates[0].eventName}` : 'Invitation to Register'
  );
  const [registrationUrl, setRegistrationUrl] = useState(
    templates[0] ? `${siteUrl}/register/${templates[0].slug}` : `${siteUrl}/register`
  );
  const [bannerImageUrl, setBannerImageUrl] = useState(
    templates[0]?.theme?.bannerImageUrl ||
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80'
  );
  const [fallbackText, setFallbackText] = useState('Register for Wonderla Event');
  const [body, setBody] = useState(
    `Dear Employee,\n\nYou are cordially invited to attend our upcoming celebration. Please submit your registration and ticket requirements by clicking the link below.\n\nTransportation cab options and spouse attendance are available. Kindly complete your registration promptly so that entrance tickets can be reserved for you and your family.\n\nBest regards,\nWonderla Event Organizing Committee`
  );
  const [recipientsText, setRecipientsText] = useState('');
  const [testEmail, setTestEmail] = useState('admin@wonderla.com');

  const [campaigns, setCampaigns] = useState<IEmailCampaignDocument[]>(initialCampaigns);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    toast[type](message);
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = templates.find((t) => t._id === templateId);
    if (tmpl) {
      setSubject(`Invitation: ${tmpl.eventName}`);
      setRegistrationUrl(`${siteUrl}/register/${tmpl.slug}`);
      if (tmpl.theme?.bannerImageUrl) {
        setBannerImageUrl(tmpl.theme.bannerImageUrl);
      }
      setFallbackText(`Register for ${tmpl.eventName}`);
    }
  };

  const parsedRecipients = recipientsText
    .split(/[\n,;]+/)
    .map((e) => e.trim())
    .filter((e) => e.includes('@'));

  const handleSendTest = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      showNotification('error', 'Please enter a valid test recipient email address');
      return;
    }

    setIsSendingTest(true);
    try {
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testEmail,
          subject,
          body,
          registrationUrl,
          bannerImageUrl,
          fallbackText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showNotification('success', data.message || `Test email dispatched to ${testEmail}`);
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to send test email');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleDispatchCampaign = async () => {
    if (parsedRecipients.length === 0) {
      showNotification('error', 'Please provide at least one valid recipient email address');
      return;
    }

    if (!confirm(`Are you ready to dispatch this email campaign to ${parsedRecipients.length} recipients individually?`)) {
      return;
    }

    setIsDispatching(true);
    try {
      // 1. Create campaign draft
      const draftRes = await fetch('/api/email/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          body,
          registrationUrl,
          bannerImageUrl,
          fallbackText,
          recipients: parsedRecipients,
        }),
      });
      const draftData = await draftRes.json();
      if (!draftRes.ok) throw new Error(draftData.error);

      const campaignId = draftData.campaign._id;

      // 2. Trigger send
      const sendRes = await fetch(`/api/email/campaigns/${campaignId}/send`, {
        method: 'POST',
      });
      const sendData = await sendRes.json();
      if (!sendRes.ok) throw new Error(sendData.error);

      showNotification(
        'success',
        `Campaign dispatched! Sent: ${sendData.sentCount}, Failed: ${sendData.failedCount}`
      );

      // Refresh campaign history
      const listRes = await fetch('/api/email/campaigns');
      const listData = await listRes.json();
      if (listData.campaigns) {
        setCampaigns(listData.campaigns);
      }
    } catch (err) {
      showNotification(
        'error',
        err instanceof Error ? err.message : 'Error sending email campaign'
      );
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-6 h-6 text-blue-600" />
            Email Campaign Composer
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Compose and broadcast high-deliverability event invitations directly from your authorized Gmail account.
          </p>
        </div>
      </div>

      {/* Two Column Layout: Editor (Left) & Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Form Column */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
              Campaign Details
            </h3>

            {/* Template Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Link to Event Template
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
              >
                {templates.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.eventName} ({t.slug})
                  </option>
                ))}
              </select>
            </div>

            {/* Email Subject */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Subject Line <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Wonderla BANDHAN 13.2 - Complete Your Registration"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white font-medium"
              />
            </div>

            {/* Registration Destination URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Registration Landing Page URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                value={registrationUrl}
                onChange={(e) => setRegistrationUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-white"
              />
            </div>

            {/* Banner Image URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Banner Image URL (Clickable Header)
              </label>
              <input
                type="url"
                value={bannerImageUrl}
                onChange={(e) => setBannerImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
              />
            </div>

            {/* Fallback Alt Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Banner Fallback Alt Text
              </label>
              <input
                type="text"
                value={fallbackText}
                onChange={(e) => setFallbackText(e.target.value)}
                placeholder="Register for Wonderla Event"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white"
              />
            </div>

            {/* Body */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Body Text <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={7}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white leading-relaxed"
              />
            </div>

            {/* Recipients */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Recipients List <span className="text-rose-500">*</span>
                </label>
                <Badge variant={parsedRecipients.length > 0 ? 'success' : 'default'}>
                  {parsedRecipients.length} valid recipients
                </Badge>
              </div>
              <textarea
                rows={4}
                value={recipientsText}
                onChange={(e) => setRecipientsText(e.target.value)}
                placeholder="Paste emails separated by commas, spaces, or newlines..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
              <p className="text-[11px] text-slate-400">
                Emails are transmitted individually so attendees never see other recipients in the headers.
              </p>
            </div>

            {/* Test Send Section */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Send Test Email
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="admin@wonderla.com"
                  className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSendTest}
                  isLoading={isSendingTest}
                  disabled={!testEmail.trim()}
                >
                  <Send className="w-3.5 h-3.5 mr-1 text-blue-600" />
                  Send Test
                </Button>
              </div>
            </div>

            {/* Dispatch Button */}
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-md"
                onClick={handleDispatchCampaign}
                isLoading={isDispatching}
                disabled={parsedRecipients.length === 0}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Dispatch Campaign to {parsedRecipients.length} Attendees
              </Button>
            </div>
          </Card>
        </div>

        {/* Live Visual Preview Column */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-blue-600" />
              Live Email Client Preview
            </span>
            <span className="text-[11px] text-slate-400">Desktop / Mobile Inbox view</span>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-4 shadow-xl">
            {/* Subject preview */}
            <div className="bg-white dark:bg-slate-800 p-3 rounded-t-xl border-b border-slate-100 dark:border-slate-700 text-xs">
              <span className="text-slate-400 font-medium block">Subject:</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                {subject || 'No subject entered'}
              </span>
            </div>

            {/* Email Card Simulation */}
            <div className="bg-white dark:bg-slate-800 rounded-b-xl overflow-hidden shadow-xs">
              {/* Clickable Banner */}
              {bannerImageUrl && (
                <a
                  href={registrationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block relative group overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bannerImageUrl}
                    alt={fallbackText}
                    className="w-full max-h-48 object-cover group-hover:opacity-95 transition"
                  />
                  <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="bg-black/60 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                      Click to open registration <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </a>
              )}

              {/* Body */}
              <div className="p-5 space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {body}

                <div className="pt-2 text-center">
                  <a
                    href={registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block bg-blue-600 text-white font-bold text-xs py-2.5 px-6 rounded-lg shadow-sm hover:bg-blue-700 transition"
                  >
                    Register for Event &rarr;
                  </a>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 text-[11px] text-slate-400 text-center">
                  &copy; {new Date().getFullYear()} Wonderla Event Management.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign History Table */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Campaign History & Dispatch Logs
            </h3>
          </div>
          <span className="text-xs text-slate-400">{campaigns.length} total campaigns</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Recipients</th>
                <th className="px-4 py-3 text-center">Delivered</th>
                <th className="px-4 py-3 text-center">Failed</th>
                <th className="px-4 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No email campaigns dispatched yet.
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={String(c._id)} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {c.subject}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          c.status === 'SENT'
                            ? 'success'
                            : c.status === 'SENDING'
                              ? 'warning'
                              : c.status === 'PARTIALLY_SENT'
                                ? 'purple'
                                : 'default'
                        }
                      >
                        {c.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center font-mono">
                      {c.recipients?.length || 0}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-emerald-600 font-bold">
                      {c.sentCount || 0}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-rose-500">
                      {c.failedCount || 0}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default EmailComposerClient;

