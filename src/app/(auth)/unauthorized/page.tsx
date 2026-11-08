'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="shadow-lg border-rose-200 dark:border-rose-950 text-center">
          <CardContent className="p-8 space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Access Denied</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your Google account is not allowlisted to access the Registration Management Platform, or your account has been deactivated.
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 dark:bg-slate-800/60 p-3.5 text-xs text-slate-600 dark:text-slate-300 text-left">
              If you require administrative access, please contact the platform administrator to add your email address to the authorized users list.
            </div>

            <Link href="/login" className="block">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

