import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import RegistrationTemplate from '@/models/RegistrationTemplate';
import Component from '@/models/Component';
import { generateStandaloneHtml } from '@/lib/html-export/generate-standalone-html';
import { IRegistrationTemplate, IComponent } from '@/types';
import mongoose from 'mongoose';

interface RouteParams {
  params: Promise<{
    templateId: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const { templateId } = await params;

    const isObjectId = mongoose.Types.ObjectId.isValid(templateId);
    const rawTemplate = await RegistrationTemplate.findOne(
      isObjectId ? { _id: templateId } : { slug: templateId }
    ).lean();

    if (!rawTemplate) {
      return NextResponse.json(
        { success: false, error: 'Registration template not found' },
        { status: 404 }
      );
    }

    const template: IRegistrationTemplate = JSON.parse(JSON.stringify(rawTemplate));

    const rawComponents = await Component.find({ active: true }).lean();
    const components: IComponent[] = JSON.parse(JSON.stringify(rawComponents));

    const publicApiBaseUrl =
      process.env.PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      req.nextUrl.origin ||
      'http://localhost:3000';

    const standaloneHtml = generateStandaloneHtml(template, components, publicApiBaseUrl);

    const filename = `${template.slug}-registration.html`;

    return new NextResponse(standaloneHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Export HTML Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate standalone HTML' },
      { status: 500 }
    );
  }
}
