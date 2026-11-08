import mongoose, { Schema, Document, Model } from 'mongoose';
import { RegistrationStatus, SyncStatus, ITicketSummary, IRegistrationFile, IIntegrationError } from '@/types';

export interface IRegistrationDocument extends Document {
  registrationId: string;
  templateId: mongoose.Types.ObjectId;
  templateVersion: number;
  eventName: string;
  data: Record<string, unknown>;
  files: IRegistrationFile[];
  ticketSummary: ITicketSummary;
  status: RegistrationStatus;
  idempotencyKey: string;
  sheetsSyncStatus: SyncStatus;
  driveSyncStatus: SyncStatus;
  integrationErrors: IIntegrationError[];
  sourceOrigin?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema = new Schema<IRegistrationFile>(
  {
    fieldKey: { type: String, required: true },
    originalFilename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    driveFileId: { type: String },
    driveViewUrl: { type: String },
  },
  { _id: false }
);

const IntegrationErrorSchema = new Schema<IIntegrationError>(
  {
    service: {
      type: String,
      enum: ['SHEETS', 'DRIVE', 'SYSTEM'],
      required: true,
    },
    error: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TicketSummarySchema = new Schema<ITicketSummary>(
  {
    employeeTickets: { type: Number, default: 1 },
    spouseTickets: { type: Number, default: 0 },
    kidsTickets: { type: Number, default: 0 },
    kidsAbove75cm: { type: Number, default: 0 },
    kidsBelow75cm: { type: Number, default: 0 },
    totalTickets: { type: Number, default: 1 },
  },
  { _id: false }
);

const RegistrationSchema = new Schema<IRegistrationDocument>(
  {
    registrationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'RegistrationTemplate',
      required: true,
      index: true,
    },
    templateVersion: {
      type: Number,
      required: true,
    },
    eventName: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    files: {
      type: [FileSchema],
      default: [],
    },
    ticketSummary: {
      type: TicketSummarySchema,
      required: true,
      default: () => ({
        employeeTickets: 1,
        spouseTickets: 0,
        kidsTickets: 0,
        kidsAbove75cm: 0,
        kidsBelow75cm: 0,
        totalTickets: 1,
      }),
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'REJECTED'],
      default: 'CONFIRMED',
      index: true,
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    sheetsSyncStatus: {
      type: String,
      enum: ['PENDING', 'SYNCED', 'FAILED'],
      default: 'PENDING',
      index: true,
    },
    driveSyncStatus: {
      type: String,
      enum: ['PENDING', 'SYNCED', 'FAILED', 'SKIPPED'],
      default: 'PENDING',
      index: true,
    },
    integrationErrors: {
      type: [IntegrationErrorSchema],
      default: [],
    },
    sourceOrigin: {
      type: String,
      trim: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Registration: Model<IRegistrationDocument> =
  mongoose.models.Registration ||
  mongoose.model<IRegistrationDocument>('Registration', RegistrationSchema);

export default Registration;

