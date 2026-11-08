import { NextResponse } from 'next/server';
import { testDriveConnection } from '@/lib/google/drive';

export async function GET() {
  const result = await testDriveConnection();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

export async function POST() {
  const result = await testDriveConnection();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

