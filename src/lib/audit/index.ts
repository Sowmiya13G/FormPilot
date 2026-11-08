import connectToDatabase from '@/lib/db/mongoose';
import AuditLog from '@/models/AuditLog';

interface AuditLogOptions {
  actor: string;
  action: string;
  resourceType: string;
  resourceId: string;
  beforeSummary?: Record<string, unknown>;
  afterSummary?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAudit(options: AuditLogOptions) {
  try {
    await connectToDatabase();
    await AuditLog.create({
      ...options,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('Failed to create audit log entry:', err);
  }
}

export default logAudit;

