import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Registration from '@/models/Registration';
import RegistrationTemplate from '@/models/RegistrationTemplate';
import { syncRegistrationToSheet } from '@/lib/google/sheets';
import { IRegistrationTemplate } from '@/types';

export async function POST(
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
    });

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    const rawTemplate = await RegistrationTemplate.findById(registration.templateId).lean();
    if (!rawTemplate) {
      return NextResponse.json(
        { error: 'Associated event template not found' },
        { status: 404 }
      );
    }

    const template: IRegistrationTemplate = JSON.parse(JSON.stringify(rawTemplate));

    try {
      const syncResult = await syncRegistrationToSheet(template, registration);

      registration.sheetsSyncStatus = 'SYNCED';
      await registration.save();

      return NextResponse.json({
        success: true,
        message: 'Registration synchronized to Google Sheets successfully.',
        updatedRange: syncResult.updatedRange,
      });
    } catch (syncError) {
      const errorMessage =
        syncError instanceof Error ? syncError.message : 'Unknown synchronization error';

      registration.sheetsSyncStatus = 'FAILED';
      registration.integrationErrors.push({
        service: 'SHEETS',
        error: errorMessage,
        timestamp: new Date(),
      });
      await registration.save();

      return NextResponse.json(
        {
          error: `Sheets sync failed: ${errorMessage}`,
          sheetsSyncStatus: 'FAILED',
        },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error('Error in manual sheets sync retry:', err);
    return NextResponse.json(
      { error: 'Internal error processing sync retry' },
      { status: 500 }
    );
  }
}

