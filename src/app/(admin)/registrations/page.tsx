import React, { Suspense } from 'react';
import connectDB from '@/lib/db/mongoose';
import Registration from '@/models/Registration';
import RegistrationsClient from './RegistrationsClient';
import { IRegistration } from '@/types';

async function RegistrationsDataLoader() {
  await connectDB();

  const [rawRegistrations, total, distinctEvents] = await Promise.all([
    Registration.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
    Registration.countDocuments(),
    Registration.distinct('eventName'),
  ]);

  const registrations: IRegistration[] = JSON.parse(JSON.stringify(rawRegistrations));

  return (
    <RegistrationsClient
      initialRegistrations={registrations}
      initialTotal={total}
      distinctEvents={distinctEvents}
    />
  );
}

export default function RegistrationsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      }
    >
      <RegistrationsDataLoader />
    </Suspense>
  );
}
