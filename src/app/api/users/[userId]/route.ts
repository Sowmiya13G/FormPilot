import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import User from '@/models/User';
import { requireAdmin, handleAuthError } from '@/lib/auth/permissions';
import { updateUserSchema } from '@/lib/validations/user';
import { logAudit } from '@/lib/audit';

interface RouteParams {
  params: Promise<{
    userId: string;
  }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin();
    const { userId } = await params;
    await connectToDatabase();

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);

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

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Self-lockout prevention: An admin cannot demote or deactivate their own active account
    const isSelf = admin.id === targetUser._id.toString() || admin.email === targetUser.email;

    if (isSelf) {
      if (parsed.data.active === false) {
        return NextResponse.json(
          {
            success: false,
            error: 'You cannot deactivate your own account',
          },
          { status: 400 }
        );
      }
      if (parsed.data.role && parsed.data.role !== 'ADMIN') {
        return NextResponse.json(
          {
            success: false,
            error: 'You cannot remove your own administrator privileges',
          },
          { status: 400 }
        );
      }
    }

    const beforeSummary = {
      role: targetUser.role,
      active: targetUser.active,
      name: targetUser.name,
    };

    if (parsed.data.role !== undefined) {
      targetUser.role = parsed.data.role;
    }
    if (parsed.data.active !== undefined) {
      targetUser.active = parsed.data.active;
    }
    if (parsed.data.name !== undefined) {
      targetUser.name = parsed.data.name;
    }

    await targetUser.save();

    await logAudit({
      actor: admin.email,
      action: 'USER_UPDATED',
      resourceType: 'User',
      resourceId: targetUser._id.toString(),
      beforeSummary,
      afterSummary: {
        role: targetUser.role,
        active: targetUser.active,
        name: targetUser.name,
      },
    });

    return NextResponse.json({
      success: true,
      data: targetUser,
      message: 'User updated successfully',
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin();
    const { userId } = await params;
    await connectToDatabase();

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Prevent self-deletion
    const isSelf = admin.id === targetUser._id.toString() || admin.email === targetUser.email;
    if (isSelf) {
      return NextResponse.json(
        {
          success: false,
          error: 'You cannot delete your own account',
        },
        { status: 400 }
      );
    }

    const beforeSummary = {
      email: targetUser.email,
      name: targetUser.name,
      role: targetUser.role,
      active: targetUser.active,
    };

    await User.findByIdAndDelete(userId);

    await logAudit({
      actor: admin.email,
      action: 'USER_DELETED',
      resourceType: 'User',
      resourceId: userId,
      beforeSummary,
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

