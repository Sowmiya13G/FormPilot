import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Registration from '@/models/Registration';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ registrationId: string }> }
) {
  try {
    const { registrationId } = await params;
    await connectDB();

    const registration = await Registration.findOne({
      $or: [
        { registrationId },
        { _id: registrationId.match(/^[0-9a-fA-F]{24}$/) ? registrationId : null },
      ],
    }).lean();

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(registration);
  } catch (error) {
    console.error('Error fetching registration detail:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve registration' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ registrationId: string }> }
) {
  try {
    const { registrationId } = await params;
    const body = await request.json();
    await connectDB();

    const allowedUpdates = ['status', 'sheetsSyncStatus', 'driveSyncStatus'];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {};

    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    const updated = await Registration.findOneAndUpdate(
      {
        $or: [
          { registrationId },
          { _id: registrationId.match(/^[0-9a-fA-F]{24}$/) ? registrationId : null },
        ],
      },
      { $set: updates },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json(
      { error: 'Failed to update registration' },
      { status: 500 }
    );
  }
}
