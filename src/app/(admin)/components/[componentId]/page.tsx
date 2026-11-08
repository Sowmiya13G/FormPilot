import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import connectToDatabase from '@/lib/db/mongoose';
import Component from '@/models/Component';
import ComponentEditor from '@/components/form-builder/ComponentEditor';
import { IComponent } from '@/types';
import mongoose from 'mongoose';

interface PageProps {
  params: Promise<{
    componentId: string;
  }>;
}

async function EditComponentDataLoader({ params }: PageProps) {
  const { componentId } = await params;
  await connectToDatabase();

  const isObjectId = mongoose.Types.ObjectId.isValid(componentId);
  const rawComponent = await Component.findOne(
    isObjectId ? { _id: componentId } : { key: componentId }
  ).lean();

  if (!rawComponent) {
    notFound();
  }

  const component: IComponent = JSON.parse(JSON.stringify(rawComponent));

  return <ComponentEditor initialData={component} isEditing={true} />;
}

export default function EditComponentPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      }
    >
      <EditComponentDataLoader params={params} />
    </Suspense>
  );
}
