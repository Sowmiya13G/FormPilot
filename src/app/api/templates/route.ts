import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import RegistrationTemplate from '@/models/RegistrationTemplate';
import { requireEditor, handleAuthError } from '@/lib/auth/permissions';
import { createTemplateSchema } from '@/lib/validations/template';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { eventName: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    const templates = await RegistrationTemplate.find(filter)
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const editor = await requireEditor();
    await connectToDatabase();

    const body = await req.json();
    const parsed = createTemplateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { slug } = parsed.data;

    // Check duplicate slug
    const existing = await RegistrationTemplate.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `An event template with slug "${slug}" already exists`,
        },
        { status: 409 }
      );
    }

    const newTemplate = await RegistrationTemplate.create({
      ...parsed.data,
      status: 'DRAFT',
      version: 1,
      createdBy: editor.email,
      updatedBy: editor.email,
    });

    await logAudit({
      actor: editor.email,
      action: 'TEMPLATE_CREATED',
      resourceType: 'RegistrationTemplate',
      resourceId: newTemplate._id.toString(),
      afterSummary: {
        eventName: newTemplate.eventName,
        slug: newTemplate.slug,
        fieldsCount: newTemplate.fields?.length || 0,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newTemplate,
        message: 'Template created successfully as draft',
      },
      { status: 201 }
    );
  } catch (error) {
    return handleAuthError(error);
  }
}

