import { NextRequest, NextResponse } from 'next/server';
import { listDriveFolders, ensureEventFolder } from '@/lib/google/drive';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId') || undefined;

    const folders = await listDriveFolders(parentId);
    return NextResponse.json({ folders });
  } catch (err) {
    console.error('Error listing drive folders:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to list folders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventName, parentFolderId } = body;

    if (!eventName) {
      return NextResponse.json(
        { error: 'eventName is required to create an event folder' },
        { status: 400 }
      );
    }

    const folderId = await ensureEventFolder(eventName, parentFolderId);
    return NextResponse.json({ success: true, folderId });
  } catch (err) {
    console.error('Error creating event drive folder:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create folder' },
      { status: 500 }
    );
  }
}

