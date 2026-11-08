import { NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/google/auth';

export async function GET() {
  try {
    const authUrl = getGoogleAuthUrl('settings_connect');
    return NextResponse.redirect(authUrl);
  } catch (err) {
    console.error('Error generating Google auth URL:', err);
    return NextResponse.json(
      {
        error:
          'Failed to initialize Google OAuth. Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are configured.',
      },
      { status: 500 }
    );
  }
}

