import { google } from 'googleapis';
import { getAuthenticatedGoogleClient } from '@/lib/google/auth';
import connectDB from '@/lib/db/mongoose';
import EmailCampaign from '@/models/EmailCampaign';
import { buildEmailHtml, buildPlainTextFallback } from './template-builder';

/**
 * Returns an authenticated Gmail API client
 */
export async function getGmailClient() {
  const auth = await getAuthenticatedGoogleClient('gmail');
  return google.gmail({ version: 'v1', auth });
}

export interface SendSingleEmailOptions {
  to: string;
  from?: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Constructs an RFC 2822 formatted email message string
 */
export function buildMimeMessage(options: SendSingleEmailOptions): string {
  const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const cleanSubject = options.subject.replace(/[\r\n]/g, '');

  const lines = [
    `To: ${options.to}`,
    options.from ? `From: ${options.from}` : '',
    `Subject: =?UTF-8?B?${Buffer.from(cleanSubject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(options.text || 'Please view this email in an HTML-compatible client.').toString('base64'),
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(options.html).toString('base64'),
    '',
    `--${boundary}--`,
  ];

  return lines.filter((line) => line !== null).join('\r\n');
}

/**
 * Sends a single email using the authenticated Gmail account
 */
export async function sendEmailViaGmail(options: SendSingleEmailOptions): Promise<{ messageId: string }> {
  const gmail = await getGmailClient();
  const mime = buildMimeMessage(options);
  const raw = Buffer.from(mime).toString('base64url');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw,
    },
  });

  return {
    messageId: res.data.id || '',
  };
}

/**
 * Dispatches an email campaign to all recipients individually
 */
export async function sendCampaignViaGmail(campaignId: string) {
  await connectDB();

  const campaign = await EmailCampaign.findById(campaignId);
  if (!campaign) {
    throw new Error('Email campaign not found');
  }

  campaign.status = 'SENDING';
  await campaign.save();

  // Generate HTML and plain text email content
  const htmlContent = buildEmailHtml({
    subject: campaign.subject,
    body: campaign.body,
    registrationUrl: campaign.registrationUrl,
    bannerImageUrl: campaign.bannerImageUrl,
    fallbackText: campaign.fallbackText,
  });

  const textContent = buildPlainTextFallback({
    subject: campaign.subject,
    body: campaign.body,
    registrationUrl: campaign.registrationUrl,
  });

  let sent = 0;
  let failed = 0;
  const messageIds: string[] = [];
  const errors: Array<{ recipient: string; error: string; timestamp: Date }> = [];

  for (const recipient of campaign.recipients) {
    const cleanEmail = recipient.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) continue;

    try {
      const result = await sendEmailViaGmail({
        to: cleanEmail,
        subject: campaign.subject,
        html: htmlContent,
        text: textContent,
      });

      sent += 1;
      if (result.messageId) messageIds.push(result.messageId);

      // Brief delay between sends to respect Gmail API quotas
      await new Promise((resolve) => setTimeout(resolve, 250));
    } catch (err) {
      failed += 1;
      const errMsg = err instanceof Error ? err.message : 'Send failed';
      errors.push({
        recipient: cleanEmail,
        error: errMsg,
        timestamp: new Date(),
      });
    }
  }

  campaign.sentCount = sent;
  campaign.failedCount = failed;
  campaign.providerMessageIds = messageIds;
  campaign.errorDetails = errors;
  campaign.sentAt = new Date();
  campaign.status = failed === 0 ? 'SENT' : sent > 0 ? 'PARTIALLY_SENT' : 'FAILED';

  await campaign.save();

  return {
    success: true,
    sentCount: sent,
    failedCount: failed,
    status: campaign.status,
  };
}

/**
 * Tests Gmail connectivity and returns connected account email
 */
export async function testGmailConnection(): Promise<{
  success: boolean;
  message: string;
  email?: string;
}> {
  try {
    const gmail = await getGmailClient();
    const profile = await gmail.users.getProfile({ userId: 'me' });

    return {
      success: true,
      message: `Gmail API operational. Connected as: ${profile.data.emailAddress}`,
      email: profile.data.emailAddress || undefined,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Gmail connection test failed',
    };
  }
}

