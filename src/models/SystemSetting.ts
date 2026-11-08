import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISystemSettingDocument extends Document {
  key: string;
  value: unknown;
  description?: string;
  isSecret?: boolean;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SystemSettingSchema = new Schema<ISystemSettingDocument>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isSecret: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SystemSetting: Model<ISystemSettingDocument> =
  mongoose.models.SystemSetting ||
  mongoose.model<ISystemSettingDocument>('SystemSetting', SystemSettingSchema);

export default SystemSetting;

