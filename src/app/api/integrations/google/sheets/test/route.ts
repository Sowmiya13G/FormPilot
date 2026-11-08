import { NextRequest, NextResponse } from 'next/server';
import { testSheetsConnection } from '@/lib/google/sheets';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const spreadsheetId = searchParams.get('spreadsheetId') || undefined;
  const result = await testSheetsConnection(spreadsheetId);
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const result = await testSheetsConnection(body.spreadsheetId);
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

