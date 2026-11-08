import React, { Suspense } from 'react';
import connectToDatabase from '@/lib/db/mongoose';
import Component from '@/models/Component';
import ComponentCatalogClient from './ComponentCatalogClient';
import { IComponent } from '@/types';

async function ComponentDataLoader() {
  await connectToDatabase();

  const rawComponents = await Component.find({})
    .sort({ category: 1, label: 1 })
    .lean();

  const components: IComponent[] = JSON.parse(JSON.stringify(rawComponents));

  return <ComponentCatalogClient initialComponents={components} />;
}

export default function ComponentsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            ))}
          </div>
        </div>
      }
    >
      <ComponentDataLoader />
    </Suspense>
  );
}

