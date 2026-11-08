import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import EmailCampaign from '@/models/EmailCampaign';

export async function GET() {
  try {
    await connectDB();
    const campaigns = await EmailCampaign.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ campaigns });
  } catch (err) {
    console.error('Error fetching email campaigns:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      subject,
      body: contentBody,
      registrationUrl,
      bannerImageUrl,
      fallbackText,
      recipients,
    } = body;

    if (!subject?.trim()) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }

    if (!contentBody?.trim()) {
      return NextResponse.json({ error: 'Email body is required' }, { status: 400 });
    }

    if (!registrationUrl?.trim()) {
      return NextResponse.json({ error: 'Registration URL is required' }, { status: 400 });
    }

    const recipientList: string[] = Array.isArray(recipients)
      ? recipients
      : typeof recipients === 'string'
      ? recipients.split(/[\n,;]+/).map((e: string) => e.trim()).filter((e: string) => e.includes('@'))
      : [];

    if (recipientList.length === 0) {
      return NextResponse.json(
        { error: 'Please provide at least one valid recipient email address' },
        { status: 400 }
      );
    }

    await connectDB();

    const campaign = await EmailCampaign.create({
      subject: subject.trim(),
      body: contentBody,
      registrationUrl: registrationUrl.trim(),
      bannerImageUrl: bannerImageUrl?.trim() || undefined,
      fallbackText: fallbackText?.trim() || undefined,
      recipients: recipientList,
      status: 'DRAFT',
    });

    return NextResponse.json(
      {
        success: true,
        campaign,
        message: 'Campaign draft created successfully.',
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error creating email campaign draft:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

