import { NextRequest, NextResponse } from 'next/server';
import { fetchSheetHeaders } from '@/lib/google/sheets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const spreadsheetId = searchParams.get('spreadsheetId');
    const sheetTabId = searchParams.get('sheetTabId') || 'Registrations';

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: 'spreadsheetId query parameter is required' },
        { status: 400 }
      );
    }

    const headers = await fetchSheetHeaders(spreadsheetId, sheetTabId);
    return NextResponse.json({ headers });
  } catch (err) {
    console.error('Error fetching sheet headers:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to retrieve spreadsheet headers' },
      { status: 500 }
    );
  }
}

