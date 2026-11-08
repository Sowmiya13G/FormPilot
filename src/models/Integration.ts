import mongoose, { Schema, Document, Model } from 'mongoose';

export type IntegrationProvider = 'GOOGLE_WORKSPACE' | 'SMTP';
export type IntegrationStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

export interface IEncryptedTokens {
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  tokenType?: string;
  expiryDate?: number;
}

export interface IIntegrationDocument extends Document {
  provider: IntegrationProvider;
  ownerEmail?: string;
  encryptedTokens: IEncryptedTokens;
  scopes: string[];
  status: IntegrationStatus;
  lastTestedAt?: Date;
  lastTestResult?: {
    success: boolean;
    message?: string;
    services?: {
      drive?: boolean;
      sheets?: boolean;
      gmail?: boolean;
    };
  };
  config: {
    rootDriveFolderId?: string;
    defaultSpreadsheetId?: string;
    defaultSenderEmail?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationSchema = new Schema<IIntegrationDocument>(
  {
    provider: {
      type: String,
      required: true,
      unique: true,
      enum: ['GOOGLE_WORKSPACE', 'SMTP'],
      default: 'GOOGLE_WORKSPACE',
    },
    ownerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    encryptedTokens: {
      accessToken: { type: String },
      refreshToken: { type: String },
      idToken: { type: String },
      tokenType: { type: String, default: 'Bearer' },
      expiryDate: { type: Number },
    },
    scopes: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['CONNECTED', 'DISCONNECTED', 'ERROR'],
      default: 'DISCONNECTED',
      index: true,
    },
    lastTestedAt: {
      type: Date,
    },
    lastTestResult: {
      success: { type: Boolean },
      message: { type: String },
      services: {
        drive: { type: Boolean },
        sheets: { type: Boolean },
        gmail: { type: Boolean },
      },
    },
    config: {
      rootDriveFolderId: { type: String, trim: true },
      defaultSpreadsheetId: { type: String, trim: true },
      defaultSenderEmail: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

import { createModelProxy } from '@/lib/db/model-proxy';

const RawIntegration: Model<IIntegrationDocument> =
  mongoose.models.Integration ||
  mongoose.model<IIntegrationDocument>('Integration', IntegrationSchema);

export const Integration: Model<IIntegrationDocument> =
  createModelProxy<IIntegrationDocument>('integrations', RawIntegration);

export default Integration;

