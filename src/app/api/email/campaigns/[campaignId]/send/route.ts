import { NextRequest, NextResponse } from 'next/server';
import { sendCampaignViaGmail } from '@/lib/email/gmail';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;

    const result = await sendCampaignViaGmail(campaignId);

    return NextResponse.json({
      message: `Campaign dispatch completed. Sent: ${result.sentCount}, Failed: ${result.failedCount}`,
      ...result,
    });
  } catch (err) {
    console.error('Error dispatching email campaign:', err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Failed to dispatch campaign. Verify your Gmail connection in Settings.',
      },
      { status: 500 }
    );
  }
}

