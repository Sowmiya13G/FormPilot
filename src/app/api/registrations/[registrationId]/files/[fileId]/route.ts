import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import connectDB from '@/lib/db/mongoose';
import Registration from '@/models/Registration';
import { getFileStreamFromDrive } from '@/lib/google/drive';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ registrationId: string; fileId: string }> }
) {
  try {
    const { registrationId, fileId } = await params;
    await connectDB();

    const registration = await Registration.findOne({
      $or: [
        { registrationId },
        { _id: registrationId.match(/^[0-9a-fA-F]{24}$/) ? registrationId : null },
      ],
    }).lean();

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    const file = registration.files?.find(
      (f) => f.driveFileId === fileId || f.fieldKey === fileId || f.originalFilename === fileId
    );

    if (!file || !file.driveFileId) {
      return NextResponse.json(
        { error: 'File attachment not found or not synced to Drive' },
        { status: 404 }
      );
    }

    const driveFile = await getFileStreamFromDrive(file.driveFileId);

    // Convert Node Readable stream to Web ReadableStream for Next.js response
    const webStream = new ReadableStream({
      start(controller) {
        (driveFile.stream as Readable).on('data', (chunk) => {
          controller.enqueue(chunk);
        });
        (driveFile.stream as Readable).on('end', () => {
          controller.close();
        });
        (driveFile.stream as Readable).on('error', (err) => {
          controller.error(err);
        });
      },
    });

    const headers = new Headers();
    headers.set('Content-Type', driveFile.mimeType || file.mimeType || 'application/octet-stream');
    headers.set(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(file.originalFilename || driveFile.filename)}"`
    );
    headers.set('Cache-Control', 'private, no-cache');
    if (driveFile.size) {
      headers.set('Content-Length', String(driveFile.size));
    }

    return new NextResponse(webStream, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error streaming file from Drive proxy:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve file from secure storage' },
      { status: 500 }
    );
  }
}

