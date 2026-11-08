import { NextRequest, NextResponse } from 'next/server';
import { testDriveConnection } from '@/lib/google/drive';
import { testSheetsConnection } from '@/lib/google/sheets';
import { testGmailConnection } from '@/lib/email/gmail';
import connectDB from '@/lib/db/mongoose';
import Integration from '@/models/Integration';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');
    const body = await request.json().catch(() => ({}));

    await connectDB();
    const integration = await Integration.findOne({ provider: 'GOOGLE_WORKSPACE' });

    if (service === 'drive') {
      const res = await testDriveConnection();
      return NextResponse.json(res, { status: res.success ? 200 : 500 });
    }

    if (service === 'sheets') {
      const targetSpreadsheetId = body.spreadsheetId || integration?.config?.defaultSpreadsheetId;
      const res = await testSheetsConnection(targetSpreadsheetId);
      return NextResponse.json(res, { status: res.success ? 200 : 500 });
    }

    if (service === 'gmail') {
      const res = await testGmailConnection();
      return NextResponse.json(res, { status: res.success ? 200 : 500 });
    }

    // Default: Test all three services
    const [driveResult, sheetsResult, gmailResult] = await Promise.all([
      testDriveConnection(),
      testSheetsConnection(body.spreadsheetId || integration?.config?.defaultSpreadsheetId),
      testGmailConnection(),
    ]);

    const allSuccessful = driveResult.success && sheetsResult.success && gmailResult.success;

    if (integration) {
      integration.lastTestedAt = new Date();
      integration.lastTestResult = {
        success: allSuccessful,
        message: allSuccessful
          ? 'All Google Workspace APIs operational.'
          : 'One or more Google Workspace services encountered an error.',
        services: {
          drive: driveResult.success,
          sheets: sheetsResult.success,
          gmail: gmailResult.success,
        },
      };
      await integration.save();
    }

    return NextResponse.json({
      success: allSuccessful,
      services: {
        drive: driveResult,
        sheets: sheetsResult,
        gmail: gmailResult,
      },
    });
  } catch (err) {
    console.error('Error running Google Workspace diagnostic test:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Diagnostic test failed' },
      { status: 500 }
    );
  }
}

