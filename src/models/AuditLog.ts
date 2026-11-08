import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLogDocument extends Document {
  actor: string;
  action: string;
  resourceType: string;
  resourceId: string;
  beforeSummary?: Record<string, unknown>;
  afterSummary?: Record<string, unknown>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    actor: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      required: true,
      index: true,
    },
    resourceId: {
      type: String,
      required: true,
      index: true,
    },
    beforeSummary: {
      type: Schema.Types.Mixed,
    },
    afterSummary: {
      type: Schema.Types.Mixed,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: false,
  }
);

import { createModelProxy } from '@/lib/db/model-proxy';

const RawAuditLog: Model<IAuditLogDocument> =
  mongoose.models.AuditLog || mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);

export const AuditLog: Model<IAuditLogDocument> =
  createModelProxy<IAuditLogDocument>('audit_logs', RawAuditLog);

export default AuditLog;

