import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import RegistrationTemplate from '@/models/RegistrationTemplate';
import Registration from '@/models/Registration';
import { checkRateLimit } from '@/lib/rate-limit';
import { isOriginAllowed, getCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';
import { validateRegistrationData } from '@/lib/validations/registration';

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return handleCorsPreflight(origin, ['*']);
}

function parseFormDataPayload(formData: FormData) {
  const data: Record<string, unknown> = {};
  const files: Array<{ fieldKey: string; name: string; type: string; size: number }> = [];
  let templateId = '';
  let templateSlug = '';
  let idempotencyKey = '';

  for (const [key, value] of formData.entries()) {
    if (key === 'templateId') {
      templateId = String(value);
      continue;
    }
    if (key === 'templateSlug' || key === 'slug') {
      templateSlug = String(value);
      continue;
    }
    if (key === 'idempotencyKey') {
      idempotencyKey = String(value);
      continue;
    }
    if (key === 'templateVersion') {
      continue;
    }

    // Check if it's a file
    if (value instanceof File && value.size > 0) {
      files.push({
        fieldKey: key,
        name: value.name,
        type: value.type,
        size: value.size,
      });
      continue;
    }

    // Handle nested repeatable fields e.g. kids[0][childName]
    const bracketMatch = key.match(/^([a-zA-Z0-9_]+)\[(\d+)\]\[([a-zA-Z0-9_]+)\]$/);
    if (bracketMatch) {
      const [, arrayKey, indexStr, propKey] = bracketMatch;
      const idx = parseInt(indexStr, 10);
      if (!Array.isArray(data[arrayKey])) {
        data[arrayKey] = [];
      }
      const arr = data[arrayKey] as Array<Record<string, unknown>>;
      if (!arr[idx]) {
        arr[idx] = {};
      }
      arr[idx][propKey] = value;
      continue;
    }

    // Standard field
    data[key] = value;
  }

  if (Array.isArray(data.kids)) {
    data.kids = (data.kids as Array<unknown>).filter(Boolean);
  }

  return { data, files, templateId, templateSlug, idempotencyKey };
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const forwardedFor = request.headers.get('x-forwarded-for');
  const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

  // 1. IP Rate Limiting: max 30 requests per 60 seconds per IP
  const rateLimit = checkRateLimit(clientIp, { limit: 30, windowMs: 60 * 1000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute before submitting again.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          ...getCorsHeaders(origin, ['*']),
        },
      }
    );
  }

  try {
    await connectDB();

    let rawData: Record<string, unknown> = {};
    let fileMetadataList: Array<{
      fieldKey: string;
      originalFilename: string;
      mimeType: string;
      size: number;
    }> = [];
    let templateId = '';
    let templateSlug = '';
    let idempotencyKey =
      request.headers.get('x-idempotency-key') ||
      request.headers.get('idempotency-key') ||
      '';

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const parsed = parseFormDataPayload(formData);
      rawData = parsed.data;
      templateId = parsed.templateId;
      templateSlug = parsed.templateSlug;
      if (parsed.idempotencyKey) {
        idempotencyKey = parsed.idempotencyKey;
      }
      fileMetadataList = parsed.files.map((f) => ({
        fieldKey: f.fieldKey,
        originalFilename: f.name,
        mimeType: f.type,
        size: f.size,
      }));
    } else {
      const json = await request.json();
      rawData = (json.data && typeof json.data === 'object' ? json.data : json) as Record<string, unknown>;
      templateId = json.templateId || '';
      templateSlug = json.templateSlug || json.slug || '';
      if (json.idempotencyKey) {
        idempotencyKey = json.idempotencyKey;
      }
    }

    // 2. Validate Idempotency Key
    if (!idempotencyKey || idempotencyKey.trim().length < 8) {
      return NextResponse.json(
        { error: 'Missing or invalid X-Idempotency-Key. Please refresh and try again.' },
        { status: 400, headers: getCorsHeaders(origin, ['*']) }
      );
    }

    // 3. Look up Template (must be PUBLISHED)
    const query = templateId
      ? { _id: templateId }
      : { slug: templateSlug };

    const template = await RegistrationTemplate.findOne(query);

    if (!template) {
      return NextResponse.json(
        { error: 'Event registration template not found.' },
        { status: 404, headers: getCorsHeaders(origin, ['*']) }
      );
    }

    // 4. Verify CORS allowed origins
    const allowedOrigins = template.allowedOrigins || ['*'];
    if (!isOriginAllowed(origin, allowedOrigins)) {
      return NextResponse.json(
        { error: 'Origin not authorized to submit registrations for this event.' },
        { status: 403, headers: getCorsHeaders(origin, allowedOrigins) }
      );
    }

    const corsHeaders = getCorsHeaders(origin, allowedOrigins);

    if (template.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'This registration form is currently not accepting submissions.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 5. Idempotency Check: if this exact key was already processed, return existing registration safely
    const existingRegistration = await Registration.findOne({ idempotencyKey });
    if (existingRegistration) {
      return NextResponse.json(
        {
          success: true,
          registrationId: existingRegistration.registrationId,
          message: 'Registration already received (idempotent request)',
          ticketSummary: existingRegistration.ticketSummary,
          idempotent: true,
        },
        { status: 200, headers: corsHeaders }
      );
    }

    // 6. Validate Form Submission & Recalculate Tickets
    const validation = validateRegistrationData(rawData);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Validation failed. Please correct the invalid fields.',
          errors: validation.errors,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // 7. Generate Unique Human-Readable Registration ID
    // e.g. REG-BANDHAN-9Y3K-8PQ2
    const cleanPrefix =
      template.slug
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 7) || 'EVENT';
    const timestampCode = Date.now().toString(36).slice(-4).toUpperCase();
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const registrationId = `REG-${cleanPrefix}-${timestampCode}-${randomCode}`;

    // 8. Persist to MongoDB
    const registration = await Registration.create({
      registrationId,
      templateId: template._id,
      templateVersion: template.version,
      eventName: template.eventName,
      data: validation.sanitizedData,
      files: fileMetadataList,
      ticketSummary: validation.ticketSummary,
      status: 'CONFIRMED',
      idempotencyKey,
      sheetsSyncStatus: 'PENDING',
      driveSyncStatus: fileMetadataList.length > 0 ? 'PENDING' : 'SKIPPED',
      integrationErrors: [],
      sourceOrigin: origin || undefined,
      ipAddress: clientIp,
    });

    return NextResponse.json(
      {
        success: true,
        registrationId: registration.registrationId,
        message: 'Registration received successfully',
        ticketSummary: registration.ticketSummary,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error in POST /api/public/registrations:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected internal error occurred while saving your registration.',
      },
      { status: 500, headers: getCorsHeaders(origin, ['*']) }
    );
  }
}
