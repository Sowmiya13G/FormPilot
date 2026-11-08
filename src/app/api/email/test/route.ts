import { NextRequest, NextResponse } from 'next/server';
import { sendEmailViaGmail } from '@/lib/email/gmail';
import { buildEmailHtml, buildPlainTextFallback } from '@/lib/email/template-builder';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      testEmail,
      subject,
      body: contentBody,
      registrationUrl,
      bannerImageUrl,
      fallbackText,
      signatureHtml,
    } = body;

    if (!testEmail || !testEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Valid testEmail address is required.' },
        { status: 400 }
      );
    }

    if (!subject || !contentBody || !registrationUrl) {
      return NextResponse.json(
        { error: 'subject, body, and registrationUrl are required.' },
        { status: 400 }
      );
    }

    const html = buildEmailHtml({
      subject,
      body: contentBody,
      registrationUrl,
      bannerImageUrl,
      fallbackText,
      signatureHtml,
    });

    const text = buildPlainTextFallback({
      subject,
      body: contentBody,
      registrationUrl,
    });

    const result = await sendEmailViaGmail({
      to: testEmail,
      subject: `[Test] ${subject}`,
      html,
      text,
    });

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${testEmail}`,
      messageId: result.messageId,
    });
  } catch (err) {
    console.error('Error sending test email:', err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Failed to send test email. Ensure your Gmail account is connected in Settings.',
      },
      { status: 500 }
    );
  }
}

