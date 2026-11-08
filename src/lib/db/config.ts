/**
 * FormPilot Database & Storage Configuration
 * Allows running entirely in local JSON file storage mode or with live MongoDB.
 */

export function isLocalMode(): boolean {
  // 1. Explicit environment variable check
  if (process.env.USE_LOCAL_DATA === 'true') {
    return true;
  }
  if (process.env.USE_LOCAL_DATA === 'false') {
    return false;
  }

  // 2. Default to local data mode if not explicitly turned off or if MONGODB_URI is absent/local
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri || mongoUri === 'local' || mongoUri.includes('localhost:27017')) {
    // Default to true for zero-friction local development
    return true;
  }

  return false;
}

