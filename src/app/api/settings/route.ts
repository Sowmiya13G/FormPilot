import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import SystemSetting from '@/models/SystemSetting';
import Integration from '@/models/Integration';

export async function GET() {
  try {
    await connectDB();

    const [settingsList, integration] = await Promise.all([
      SystemSetting.find({}).lean(),
      Integration.findOne({ provider: 'GOOGLE_WORKSPACE' }).lean(),
    ]);

    const settingsMap: Record<string, unknown> = {};
    for (const item of settingsList) {
      settingsMap[item.key] = item.value;
    }

    return NextResponse.json({
      settings: settingsMap,
      integration: integration
        ? {
            provider: integration.provider,
            ownerEmail: integration.ownerEmail,
            status: integration.status,
            lastTestedAt: integration.lastTestedAt,
            lastTestResult: integration.lastTestResult,
            config: integration.config,
          }
        : null,
    });
  } catch (err) {
    console.error('Error fetching system settings:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve system settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    await connectDB();

    const { settings, googleConfig } = body;

    if (settings && typeof settings === 'object') {
      for (const [key, val] of Object.entries(settings)) {
        await SystemSetting.findOneAndUpdate(
          { key },
          { $set: { key, value: val, updatedBy: 'admin@wonderla.com' } },
          { upsert: true }
        );
      }
    }

    if (googleConfig && typeof googleConfig === 'object') {
      await Integration.findOneAndUpdate(
        { provider: 'GOOGLE_WORKSPACE' },
        {
          $set: {
            'config.rootDriveFolderId': googleConfig.rootDriveFolderId,
            'config.defaultSpreadsheetId': googleConfig.defaultSpreadsheetId,
            'config.defaultSenderEmail': googleConfig.defaultSenderEmail,
          },
        },
        { upsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully.',
    });
  } catch (err) {
    console.error('Error updating system settings:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update settings' },
      { status: 500 }
    );
  }
}

