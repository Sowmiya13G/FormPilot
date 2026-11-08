import { auth } from '@/lib/auth';
import { Role, SessionUser } from '@/types';
import { NextResponse } from 'next/server';

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session.user as SessionUser;
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

export async function requireRole(allowedRoles: Role[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error('FORBIDDEN');
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireRole(['ADMIN']);
}

export async function requireEditor(): Promise<SessionUser> {
  return requireRole(['ADMIN', 'EDITOR']);
}

export function handleAuthError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }
  }
  return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
}

