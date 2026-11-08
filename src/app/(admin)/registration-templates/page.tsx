import React, { Suspense } from 'react';
import connectToDatabase from '@/lib/db/mongoose';
import RegistrationTemplate from '@/models/RegistrationTemplate';
import RegistrationTemplateListClient from './RegistrationTemplateListClient';
import { IRegistrationTemplate } from '@/types';

async function TemplateDataLoader() {
  await connectToDatabase();

  const rawTemplates = await RegistrationTemplate.find({})
    .sort({ updatedAt: -1 })
    .lean();

  const templates: IRegistrationTemplate[] = JSON.parse(JSON.stringify(rawTemplates));

  return <RegistrationTemplateListClient initialTemplates={templates} />;
}

export default function RegistrationTemplatesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            ))}
          </div>
        </div>
      }
    >
      <TemplateDataLoader />
    </Suspense>
  );
}

