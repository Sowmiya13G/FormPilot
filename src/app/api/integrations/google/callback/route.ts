import { NextRequest, NextResponse } from 'next/server';
import { handleGoogleOAuthCallback } from '@/lib/google/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const redirectBase = `${request.nextUrl.origin}/settings`;

  if (error || !code) {
    return NextResponse.redirect(`${redirectBase}?error=${encodeURIComponent(error || 'missing_auth_code')}`);
  }

  try {
    const { ownerEmail } = await handleGoogleOAuthCallback(code);
    return NextResponse.redirect(`${redirectBase}?connected=true&email=${encodeURIComponent(ownerEmail || '')}`);
  } catch (err) {
    console.error('Error handling Google OAuth callback:', err);
    return NextResponse.redirect(
      `${redirectBase}?error=${encodeURIComponent(err instanceof Error ? err.message : 'oauth_exchange_failed')}`
    );
  }
}

