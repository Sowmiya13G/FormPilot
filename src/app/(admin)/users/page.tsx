import React, { Suspense } from 'react';
import connectToDatabase from '@/lib/db/mongoose';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth/permissions';
import UserListClient from './UserListClient';
import { IUser } from '@/types';

async function UsersDataLoader() {
  await requireAdmin();
  await connectToDatabase();

  const rawUsers = await User.find({})
    .select('-__v')
    .sort({ createdAt: -1 })
    .lean();

  const users: IUser[] = JSON.parse(JSON.stringify(rawUsers));

  return <UserListClient initialUsers={users} />;
}

export default function UsersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      }
    >
      <UsersDataLoader />
    </Suspense>
  );
}
