import React, { Suspense } from 'react';
import connectToDatabase from '@/lib/db/mongoose';
import Component from '@/models/Component';
import FormBuilder from '@/components/form-builder/FormBuilder';
import { IComponent } from '@/types';

async function NewTemplateLoader() {
  await connectToDatabase();

  const rawComponents = await Component.find({ active: true })
    .sort({ category: 1, label: 1 })
    .lean();

  const components: IComponent[] = JSON.parse(JSON.stringify(rawComponents));

  return <FormBuilder availableComponents={components} isEditing={false} />;
}

export default function NewRegistrationTemplatePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-[600px] bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      }
    >
      <NewTemplateLoader />
    </Suspense>
  );
}

