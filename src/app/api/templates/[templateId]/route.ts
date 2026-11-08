import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import RegistrationTemplate from '@/models/RegistrationTemplate';
import { requireEditor, requireAdmin, handleAuthError } from '@/lib/auth/permissions';
import { updateTemplateSchema } from '@/lib/validations/template';
import { logAudit } from '@/lib/audit';
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
    const template = await RegistrationTemplate.findOne(
      isObjectId ? { _id: templateId } : { slug: templateId }
    ).lean();

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Registration template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: template,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const editor = await requireEditor();
    const { templateId } = await params;
    await connectToDatabase();

    const body = await req.json();
    const parsed = updateTemplateSchema.safeParse(body);

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

    const beforeSummary = {
      eventName: template.eventName,
      status: template.status,
      fieldsCount: template.fields?.length || 0,
      version: template.version,
    };

    Object.assign(template, parsed.data);
    template.updatedBy = editor.email;
    await template.save();

    await logAudit({
      actor: editor.email,
      action: 'TEMPLATE_UPDATED',
      resourceType: 'RegistrationTemplate',
      resourceId: template._id.toString(),
      beforeSummary,
      afterSummary: {
        eventName: template.eventName,
        status: template.status,
        fieldsCount: template.fields?.length || 0,
        version: template.version,
      },
    });

    return NextResponse.json({
      success: true,
      data: template,
      message: 'Template updated successfully',
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin();
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

    template.status = 'ARCHIVED';
    await template.save();

    await logAudit({
      actor: admin.email,
      action: 'TEMPLATE_ARCHIVED',
      resourceType: 'RegistrationTemplate',
      resourceId: template._id.toString(),
      beforeSummary: { status: template.status },
      afterSummary: { status: 'ARCHIVED' },
    });

    return NextResponse.json({
      success: true,
      message: 'Template archived successfully',
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

