import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import RegistrationTemplate from '@/models/RegistrationTemplate';
import { requireEditor, handleAuthError } from '@/lib/auth/permissions';
import { logAudit } from '@/lib/audit';
import mongoose from 'mongoose';

interface RouteParams {
  params: Promise<{
    templateId: string;
  }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const editor = await requireEditor();
    const { templateId } = await params;
    await connectToDatabase();

    const isObjectId = mongoose.Types.ObjectId.isValid(templateId);
    const template = await RegistrationTemplate.findOne(
      isObjectId ? { _id: templateId } : { slug: templateId }
    );

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Registration template not found' },
        { status: 404 }
      );
    }

    if (!template.fields || template.fields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot publish a template with zero form fields. Please add at least one field.' },
        { status: 400 }
      );
    }

    template.status = 'PUBLISHED';
    template.version = (template.version || 1) + 1;
    template.publishedAt = new Date();
    template.updatedBy = editor.email;
    await template.save();

    await logAudit({
      actor: editor.email,
      action: 'TEMPLATE_PUBLISHED',
      resourceType: 'RegistrationTemplate',
      resourceId: template._id.toString(),
      afterSummary: {
        eventName: template.eventName,
        slug: template.slug,
        version: template.version,
        status: 'PUBLISHED',
      },
    });

    return NextResponse.json({
      success: true,
      data: template,
      message: `Template published successfully as Version ${template.version}`,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

