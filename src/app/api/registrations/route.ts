import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Registration from '@/models/Registration';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const search = searchParams.get('search')?.trim() || '';
    const templateId = searchParams.get('templateId')?.trim() || '';
    const status = searchParams.get('status')?.trim() || '';
    const sheetsSyncStatus = searchParams.get('sheetsSyncStatus')?.trim() || '';
    const driveSyncStatus = searchParams.get('driveSyncStatus')?.trim() || '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (templateId) {
      filter.templateId = templateId;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (sheetsSyncStatus && sheetsSyncStatus !== 'All') {
      filter.sheetsSyncStatus = sheetsSyncStatus;
    }

    if (driveSyncStatus && driveSyncStatus !== 'All') {
      filter.driveSyncStatus = driveSyncStatus;
    }

    if (search) {
      filter.$or = [
        { registrationId: { $regex: search, $options: 'i' } },
        { eventName: { $regex: search, $options: 'i' } },
        { 'data.employeeName': { $regex: search, $options: 'i' } },
        { 'data.name': { $regex: search, $options: 'i' } },
        { 'data.email': { $regex: search, $options: 'i' } },
        { 'data.contactNumber': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [registrations, total] = await Promise.all([
      Registration.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Registration.countDocuments(filter),
    ]);

    return NextResponse.json({
      registrations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching admin registrations:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve registrations' },
      { status: 500 }
    );
  }
}
