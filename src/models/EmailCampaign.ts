import mongoose, { Schema, Document, Model } from 'mongoose';

export type CampaignStatus =
  | 'DRAFT'
  | 'QUEUED'
  | 'SENDING'
  | 'SENT'
  | 'PARTIALLY_SENT'
  | 'FAILED';

export interface IEmailCampaignDocument extends Document {
  subject: string;
  body: string;
  bannerImageUrl?: string;
  registrationUrl: string;
  fallbackText?: string;
  recipients: string[];
  sender?: string;
  status: CampaignStatus;
  sentCount: number;
  failedCount: number;
  providerMessageIds: string[];
  errorDetails: Array<{
    recipient: string;
    error: string;
    timestamp: Date;
  }>;
  sentAt?: Date;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ErrorDetailSchema = new Schema(
  {
    recipient: { type: String, required: true },
    error: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const EmailCampaignSchema = new Schema<IEmailCampaignDocument>(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    bannerImageUrl: {
      type: String,
      trim: true,
    },
    registrationUrl: {
      type: String,
      required: true,
      trim: true,
    },
    fallbackText: {
      type: String,
      trim: true,
    },
    recipients: {
      type: [String],
      required: true,
      default: [],
    },
    sender: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'QUEUED', 'SENDING', 'SENT', 'PARTIALLY_SENT', 'FAILED'],
      default: 'DRAFT',
      index: true,
    },
    sentCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    providerMessageIds: {
      type: [String],
      default: [],
    },
    errorDetails: {
      type: [ErrorDetailSchema],
      default: [],
    },
    sentAt: {
      type: Date,
    },
    createdBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const EmailCampaign: Model<IEmailCampaignDocument> =
  mongoose.models.EmailCampaign ||
  mongoose.model<IEmailCampaignDocument>('EmailCampaign', EmailCampaignSchema);

export default EmailCampaign;

