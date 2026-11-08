import { Readable } from 'stream';
import { google } from 'googleapis';
import { getAuthenticatedGoogleClient } from '@/lib/google/auth';
import connectDB from '@/lib/db/mongoose';
import Integration from '@/models/Integration';

/**
 * Returns an authenticated Google Drive API client
 */
export async function getDriveClient() {
  const auth = await getAuthenticatedGoogleClient('drive');
  return google.drive({ version: 'v3', auth });
}

/**
 * Finds or creates a designated Google Drive folder for an event
 */
export async function ensureEventFolder(
  eventName: string,
  parentFolderId?: string
): Promise<string> {
  const drive = await getDriveClient();

  // If no parentFolderId passed, lookup root folder from Integration config or env
  let parent = parentFolderId;
  if (!parent) {
    await connectDB();
    const integration = await Integration.findOne({ provider: 'GOOGLE_WORKSPACE' });
    parent = integration?.config?.rootDriveFolderId || process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  }

  // Search for existing folder with this name under the parent folder
  const escapedName = eventName.replace(/'/g, "\\'");
  let query = `name = '${escapedName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  if (parent) {
    query += ` and '${parent}' in parents`;
  }

  const existing = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (existing.data.files && existing.data.files.length > 0 && existing.data.files[0].id) {
    return existing.data.files[0].id;
  }

  // Create new folder
  const folderMetadata: { name: string; mimeType: string; parents?: string[] } = {
    name: eventName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  if (parent) {
    folderMetadata.parents = [parent];
  }

  const res = await drive.files.create({
    requestBody: folderMetadata,
    fields: 'id, name',
  });

  if (!res.data.id) {
    throw new Error('Failed to create event folder in Google Drive.');
  }

  return res.data.id;
}

export interface UploadFileOptions {
  filename: string;
  mimeType: string;
  folderId?: string;
}

export interface UploadedDriveFileResult {
  driveFileId: string;
  filename: string;
  mimeType: string;
  size: number;
}

/**
 * Uploads a file buffer directly to Google Drive with private permissions
 */
export async function uploadFileToDrive(
  fileBuffer: Buffer,
  options: UploadFileOptions
): Promise<UploadedDriveFileResult> {
  const drive = await getDriveClient();

  const fileMetadata: { name: string; parents?: string[] } = {
    name: options.filename,
  };

  if (options.folderId) {
    fileMetadata.parents = [options.folderId];
  }

  const media = {
    mimeType: options.mimeType,
    body: Readable.from(fileBuffer),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id, name, mimeType, size',
  });

  if (!response.data.id) {
    throw new Error('Failed to upload file to Google Drive.');
  }

  return {
    driveFileId: response.data.id,
    filename: response.data.name || options.filename,
    mimeType: response.data.mimeType || options.mimeType,
    size: Number(response.data.size) || fileBuffer.length,
  };
}

/**
 * Streams a private file from Google Drive for authenticated admin viewing
 */
export async function getFileStreamFromDrive(driveFileId: string) {
  const drive = await getDriveClient();

  // 1. Get file metadata
  const meta = await drive.files.get({
    fileId: driveFileId,
    fields: 'id, name, mimeType, size',
  });

  // 2. Stream the binary media
  const response = await drive.files.get(
    { fileId: driveFileId, alt: 'media' },
    { responseType: 'stream' }
  );

  return {
    stream: response.data as NodeJS.ReadableStream,
    mimeType: meta.data.mimeType || 'application/octet-stream',
    filename: meta.data.name || 'document',
    size: Number(meta.data.size) || undefined,
  };
}

/**
 * Test connectivity to Google Drive API
 */
export async function testDriveConnection(): Promise<{
  success: boolean;
  message: string;
  email?: string;
}> {
  try {
    const drive = await getDriveClient();
    const about = await drive.about.get({ fields: 'user' });

    return {
      success: true,
      message: 'Google Drive API connected and operational.',
      email: about.data.user?.emailAddress || undefined,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Google Drive API test failed',
    };
  }
}

/**
 * List folders in Google Drive for administrative picker
 */
export async function listDriveFolders(parentFolderId?: string) {
  const drive = await getDriveClient();
  let query = "mimeType = 'application/vnd.google-apps.folder' and trashed = false";
  if (parentFolderId) {
    query += ` and '${parentFolderId}' in parents`;
  }

  const res = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
    pageSize: 50,
  });

  return (res.data.files || []).map((f) => ({
    id: f.id || '',
    name: f.name || 'Untitled Folder',
  }));
}

