import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import connectToDatabase from '@/lib/db/mongoose';
import RegistrationTemplate from '@/models/RegistrationTemplate';
import Component from '@/models/Component';
import DynamicFormRenderer from '@/components/dynamic-form/DynamicFormRenderer';
import { IRegistrationTemplate, IComponent } from '@/types';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function PublicRegisterLoader({ params }: PageProps) {
  const { slug } = await params;
  await connectToDatabase();

  const rawTemplate = await RegistrationTemplate.findOne({
    slug,
    status: 'PUBLISHED',
  }).lean();

  if (!rawTemplate) {
    notFound();
  }

  const rawComponents = await Component.find({ active: true }).lean();

  const template: IRegistrationTemplate = JSON.parse(JSON.stringify(rawTemplate));
  const components: IComponent[] = JSON.parse(JSON.stringify(rawComponents));

  const componentLookup: Record<string, IComponent> = {};
  components.forEach((c) => {
    componentLookup[c.key] = c;
  });

  return (
    <div className="min-h-screen py-10 px-4 flex flex-col items-center justify-start">
      <DynamicFormRenderer
        fields={template.fields}
        theme={template.theme}
        eventName={template.eventName}
        slug={template.slug}
        templateId={template._id}
        description={template.description}
        componentLookup={componentLookup}
      />
      <div className="mt-8 text-center text-xs text-slate-400">
        Powered by FormPilot &bull; The Registration Hub
      </div>
    </div>
  );
}

export default function PublicRegisterPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-xl h-96 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
        </div>
      }
    >
      <PublicRegisterLoader params={params} />
    </Suspense>
  );
}
