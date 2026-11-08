import React, { Suspense } from 'react';
import connectDB from '@/lib/db/mongoose';
import RegistrationTemplate from '@/models/RegistrationTemplate';
import EmailCampaign from '@/models/EmailCampaign';
import EmailComposerClient from './EmailComposerClient';
import { IRegistrationTemplate } from '@/types';

async function SendEmailDataLoader() {
  await connectDB();

  const [rawTemplates, rawCampaigns] = await Promise.all([
    RegistrationTemplate.find({ status: 'PUBLISHED' }).sort({ updatedAt: -1 }).lean(),
    EmailCampaign.find({}).sort({ createdAt: -1 }).limit(20).lean(),
  ]);

  const templates: IRegistrationTemplate[] = JSON.parse(JSON.stringify(rawTemplates));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const campaigns: any[] = JSON.parse(JSON.stringify(rawCampaigns));
  const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  return (
    <EmailComposerClient
      templates={templates}
      initialCampaigns={campaigns}
      siteUrl={siteUrl}
    />
  );
}

export default function SendEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 h-96 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="lg:col-span-5 h-96 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      }
    >
      <SendEmailDataLoader />
    </Suspense>
  );
}

