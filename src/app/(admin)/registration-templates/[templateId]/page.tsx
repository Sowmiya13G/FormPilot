import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import connectToDatabase from '@/lib/db/mongoose';
import RegistrationTemplate from '@/models/RegistrationTemplate';
import Component from '@/models/Component';
import FormBuilder from '@/components/form-builder/FormBuilder';
import { IRegistrationTemplate, IComponent } from '@/types';
import mongoose from 'mongoose';

interface PageProps {
  params: Promise<{
    templateId: string;
  }>;
}

async function EditTemplateDataLoader({ params }: PageProps) {
  const { templateId } = await params;
  await connectToDatabase();

  const isObjectId = mongoose.Types.ObjectId.isValid(templateId);
  const rawTemplate = await RegistrationTemplate.findOne(
    isObjectId ? { _id: templateId } : { slug: templateId }
  ).lean();

  if (!rawTemplate) {
    notFound();
  }

  const rawComponents = await Component.find({ active: true })
    .sort({ category: 1, label: 1 })
    .lean();

  const template: IRegistrationTemplate = JSON.parse(JSON.stringify(rawTemplate));
  const components: IComponent[] = JSON.parse(JSON.stringify(rawComponents));

  return (
    <FormBuilder
      initialTemplate={template}
      availableComponents={components}
      isEditing={true}
    />
  );
}

export default function EditRegistrationTemplatePage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-[600px] bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      }
    >
      <EditTemplateDataLoader params={params} />
    </Suspense>
  );
}

