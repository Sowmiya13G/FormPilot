import { NextResponse } from 'next/server';

/**
 * Validates request origin against template allowedOrigins
 */
export function isOriginAllowed(
  origin: string | null,
  allowedOrigins: string[] = []
): boolean {
  // If no allowedOrigins configured or contains wildcard '*', allow all
  if (!allowedOrigins || allowedOrigins.length === 0 || allowedOrigins.includes('*')) {
    return true;
  }

  // If no origin header (e.g. server-to-server or direct browser navigation), allow
  if (!origin) {
    return true;
  }

  try {
    const originUrl = new URL(origin);
    return allowedOrigins.some((allowed) => {
      if (allowed === '*') return true;
      try {
        const allowedUrl = new URL(allowed);
        return allowedUrl.origin === originUrl.origin;
      } catch {
        // Fallback for simple domain strings
        return allowed === origin;
      }
    });
  } catch {
    return false;
  }
}

/**
 * Returns CORS response headers for a given request origin
 */
export function getCorsHeaders(
  origin: string | null,
  allowedOrigins: string[] = []
): Record<string, string> {
  const allowed = isOriginAllowed(origin, allowedOrigins);
  const allowOriginValue = allowedOrigins.includes('*') || !origin ? '*' : origin;

  if (!allowed) {
    return {
      'Access-Control-Allow-Origin': 'null',
    };
  }

  return {
    'Access-Control-Allow-Origin': allowOriginValue,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Idempotency-Key, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

/**
 * Preflight OPTIONS response helper
 */
export function handleCorsPreflight(
  origin: string | null,
  allowedOrigins: string[] = []
): NextResponse {
  if (!isOriginAllowed(origin, allowedOrigins)) {
    return new NextResponse('CORS origin forbidden', { status: 403 });
  }

  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin, allowedOrigins),
  });
}

