import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import User from '@/models/User';
import { requireAdmin, handleAuthError } from '@/lib/auth/permissions';
import { inviteUserSchema } from '@/lib/validations/user';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    const users = await User.find({})
      .select('-__v')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    await connectToDatabase();

    const body = await req.json();
    const parsed = inviteUserSchema.safeParse(body);

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

    const { email, name, role } = parsed.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'A user with this email address already exists',
        },
        { status: 409 }
      );
    }

    const newUser = await User.create({
      email,
      name: name || email.split('@')[0],
      role,
      active: true,
      authProvider: 'google',
      createdBy: admin.email,
    });

    await logAudit({
      actor: admin.email,
      action: 'USER_INVITED',
      resourceType: 'User',
      resourceId: newUser._id.toString(),
      afterSummary: {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        active: newUser.active,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newUser,
        message: 'User successfully authorized',
      },
      { status: 201 }
    );
  } catch (error) {
    return handleAuthError(error);
  }
}

