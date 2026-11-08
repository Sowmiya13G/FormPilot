import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import RegistrationTemplate from '@/models/RegistrationTemplate';
import { getCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  await connectDB();
  const template = await RegistrationTemplate.findOne({
    $or: [{ slug }, { _id: slug.match(/^[0-9a-fA-F]{24}$/) ? slug : null }],
    status: 'PUBLISHED',
  }).select('allowedOrigins');

  const origin = request.headers.get('origin');
  return handleCorsPreflight(origin, template?.allowedOrigins || []);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();

    const template = await RegistrationTemplate.findOne({
      $or: [{ slug }, { _id: slug.match(/^[0-9a-fA-F]{24}$/) ? slug : null }],
      status: 'PUBLISHED',
    }).select('-sheetMapping -spreadsheetId -sheetTabId -driveFolderId');

    const origin = request.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin, template?.allowedOrigins || []);

    if (!template) {
      return NextResponse.json(
        { error: 'Registration template not found or currently inactive.' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        eventName: template.eventName,
        slug: template.slug,
        description: template.description,
        version: template.version,
        fields: template.fields,
        theme: template.theme,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error in GET /api/public/templates/[slug]:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while loading template data.' },
      { status: 500 }
    );
  }
}

