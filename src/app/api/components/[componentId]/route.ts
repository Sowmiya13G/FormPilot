import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import Component from '@/models/Component';
import { requireEditor, requireAdmin, handleAuthError } from '@/lib/auth/permissions';
import { updateComponentSchema } from '@/lib/validations/component';
import { logAudit } from '@/lib/audit';
import mongoose from 'mongoose';

interface RouteParams {
  params: Promise<{
    componentId: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const { componentId } = await params;

    const isObjectId = mongoose.Types.ObjectId.isValid(componentId);
    const component = await Component.findOne(
      isObjectId ? { _id: componentId } : { key: componentId }
    ).lean();

    if (!component) {
      return NextResponse.json(
        { success: false, error: 'Component not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: component,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const editor = await requireEditor();
    const { componentId } = await params;
    await connectToDatabase();

    const body = await req.json();
    const parsed = updateComponentSchema.safeParse(body);

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

    const isObjectId = mongoose.Types.ObjectId.isValid(componentId);
    const component = await Component.findOne(
      isObjectId ? { _id: componentId } : { key: componentId }
    );

    if (!component) {
      return NextResponse.json(
        { success: false, error: 'Component not found' },
        { status: 404 }
      );
    }

    const beforeSummary = {
      label: component.label,
      type: component.type,
      category: component.category,
      active: component.active,
      version: component.version,
    };

    // Update fields
    Object.assign(component, parsed.data);
    component.version = (component.version || 1) + 1;
    await component.save();

    await logAudit({
      actor: editor.email,
      action: 'COMPONENT_UPDATED',
      resourceType: 'Component',
      resourceId: component._id.toString(),
      beforeSummary,
      afterSummary: {
        label: component.label,
        type: component.type,
        category: component.category,
        active: component.active,
        version: component.version,
      },
    });

    return NextResponse.json({
      success: true,
      data: component,
      message: 'Component updated successfully',
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin();
    const { componentId } = await params;
    await connectToDatabase();

    const isObjectId = mongoose.Types.ObjectId.isValid(componentId);
    const component = await Component.findOne(
      isObjectId ? { _id: componentId } : { key: componentId }
    );

    if (!component) {
      return NextResponse.json(
        { success: false, error: 'Component not found' },
        { status: 404 }
      );
    }

    // Toggle active to false (soft delete) or remove
    component.active = false;
    await component.save();

    await logAudit({
      actor: admin.email,
      action: 'COMPONENT_DEACTIVATED',
      resourceType: 'Component',
      resourceId: component._id.toString(),
      beforeSummary: { active: true },
      afterSummary: { active: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Component deactivated successfully',
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

