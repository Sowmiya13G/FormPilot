import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import Component from '@/models/Component';
import { requireEditor, handleAuthError } from '@/lib/auth/permissions';
import { componentSchema } from '@/lib/validations/component';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const active = searchParams.get('active');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { label: { $regex: search, $options: 'i' } },
        { key: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (type && type !== 'All') {
      filter.type = type;
    }

    if (active !== null && active !== undefined && active !== '') {
      filter.active = active === 'true';
    }

    const components = await Component.find(filter)
      .sort({ category: 1, label: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: components,
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
    const parsed = componentSchema.safeParse(body);

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

    const { key } = parsed.data;

    // Check duplicate key
    const existing = await Component.findOne({ key });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `A component with key "${key}" already exists`,
        },
        { status: 409 }
      );
    }

    const newComponent = await Component.create(parsed.data);

    await logAudit({
      actor: editor.email,
      action: 'COMPONENT_CREATED',
      resourceType: 'Component',
      resourceId: newComponent._id.toString(),
      afterSummary: {
        key: newComponent.key,
        label: newComponent.label,
        type: newComponent.type,
        category: newComponent.category,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newComponent,
        message: 'Component created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    return handleAuthError(error);
  }
}
