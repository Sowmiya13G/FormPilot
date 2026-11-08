import { google } from 'googleapis';
import connectDB from '@/lib/db/mongoose';
import Integration from '@/models/Integration';
import { encrypt, decrypt } from '@/lib/crypto/encryption';

export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

/**
 * Returns a configured Google OAuth2 Client instance
 */
export function createOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/integrations/google/callback`;

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Generate authorization URL for Google consent screen
 */
export function getGoogleAuthUrl(state?: string): string {
  const oauth2Client = createOAuth2Client();

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // Always obtain a refresh token
    scope: GOOGLE_SCOPES,
    state: state || 'google_integration',
  });
}

/**
 * Exchange auth code for tokens and save into MongoDB Integration collection
 */
export async function handleGoogleOAuthCallback(code: string) {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Fetch connected user profile email
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const userInfo = await oauth2.userinfo.get();
  const ownerEmail = userInfo.data.email || undefined;

  await connectDB();

  const encryptedTokens = {
    accessToken: tokens.access_token ? encrypt(tokens.access_token) : undefined,
    refreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : undefined,
    idToken: tokens.id_token ? encrypt(tokens.id_token) : undefined,
    tokenType: tokens.token_type || 'Bearer',
    expiryDate: tokens.expiry_date || undefined,
  };

  const integration = await Integration.findOneAndUpdate(
    { provider: 'GOOGLE_WORKSPACE' },
    {
      $set: {
        provider: 'GOOGLE_WORKSPACE',
        ownerEmail,
        encryptedTokens,
        scopes: GOOGLE_SCOPES,
        status: 'CONNECTED',
        lastTestedAt: new Date(),
        lastTestResult: {
          success: true,
          message: `Connected successfully as ${ownerEmail}`,
        },
      },
    },
    { upsert: true, new: true }
  );

  return { integration, ownerEmail };
}

/**
 * Returns an authenticated OAuth2 client with auto-refresh configured
 */
export async function getAuthenticatedGoogleClient() {
  const oauth2Client = createOAuth2Client();

  // 1. Try loading credentials from database
  await connectDB();
  const integration = await Integration.findOne({ provider: 'GOOGLE_WORKSPACE' });

  let refreshToken: string | undefined;
  let accessToken: string | undefined;
  let expiryDate: number | undefined;

  if (integration?.encryptedTokens?.refreshToken) {
    refreshToken = decrypt(integration.encryptedTokens.refreshToken);
    if (integration.encryptedTokens.accessToken) {
      accessToken = decrypt(integration.encryptedTokens.accessToken);
    }
    expiryDate = integration.encryptedTokens.expiryDate;
  } else if (process.env.GOOGLE_REFRESH_TOKEN) {
    // 2. Fallback to environment variables
    refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    accessToken = process.env.GOOGLE_ACCESS_TOKEN;
  }

  if (!refreshToken && !accessToken) {
    throw new Error(
      'Google Workspace is not connected. Please connect your Google account in FormPilot Settings.'
    );
  }

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: expiryDate,
  });

  // Attach auto-refresh listener to update database whenever a new access token is minted
  oauth2Client.on('tokens', async (newTokens) => {
    try {
      if (newTokens.access_token) {
        await connectDB();
        const updateFields: Record<string, unknown> = {
          'encryptedTokens.accessToken': encrypt(newTokens.access_token),
          'encryptedTokens.expiryDate': newTokens.expiry_date,
        };
        if (newTokens.refresh_token) {
          updateFields['encryptedTokens.refreshToken'] = encrypt(newTokens.refresh_token);
        }

        await Integration.updateOne(
          { provider: 'GOOGLE_WORKSPACE' },
          { $set: updateFields }
        );
      }
    } catch (err) {
      console.error('Failed to update refreshed Google tokens in database:', err);
    }
  });

  return oauth2Client;
}

