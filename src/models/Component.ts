import mongoose, { Schema, Document, Model } from 'mongoose';

export type ComponentFieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'number'
  | 'date'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'checkbox-group'
  | 'textarea'
  | 'file'
  | 'hidden'
  | 'section'
  | 'info'
  | 'repeatable';

export type ComponentCategory =
  | 'Personal Details'
  | 'Travel & Stay'
  | 'ID & Verification'
  | 'Family & Kids'
  | 'Custom';

export interface ISelectOption {
  label: string;
  value: string;
}

export interface IValidationConfig {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
  minValue?: number;
  maxValue?: number;
  maxFileSize?: number; // in bytes, default 5242880 (5MB)
  allowedFileTypes?: string[]; // e.g. ['.jpg', '.jpeg', '.png', '.pdf']
}

export interface IComponentDocument extends Document {
  key: string;
  label: string;
  description?: string;
  type: ComponentFieldType;
  category: ComponentCategory;
  placeholder?: string;
  helpText?: string;
  defaultValue?: unknown;
  defaultRequired: boolean;
  options?: ISelectOption[];
  validationConfig?: IValidationConfig;
  active: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const ComponentSchema = new Schema<IComponentDocument>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'text',
        'email',
        'tel',
        'number',
        'date',
        'select',
        'radio',
        'checkbox',
        'checkbox-group',
        'textarea',
        'file',
        'hidden',
        'section',
        'info',
        'repeatable',
      ],
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Personal Details',
        'Travel & Stay',
        'ID & Verification',
        'Family & Kids',
        'Custom',
      ],
      default: 'Custom',
      index: true,
    },
    placeholder: {
      type: String,
      trim: true,
    },
    helpText: {
      type: String,
      trim: true,
    },
    defaultValue: {
      type: Schema.Types.Mixed,
    },
    defaultRequired: {
      type: Boolean,
      default: false,
    },
    options: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    validationConfig: {
      minLength: { type: Number },
      maxLength: { type: Number },
      pattern: { type: String },
      patternMessage: { type: String },
      minValue: { type: Number },
      maxValue: { type: Number },
      maxFileSize: { type: Number, default: 5242880 },
      allowedFileTypes: { type: [String], default: ['.jpg', '.jpeg', '.png', '.pdf'] },
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

import { createModelProxy } from '@/lib/db/model-proxy';

const RawComponent: Model<IComponentDocument> =
  mongoose.models.Component || mongoose.model<IComponentDocument>('Component', ComponentSchema);

export const Component: Model<IComponentDocument> = createModelProxy<IComponentDocument>(
  'components',
  RawComponent
);

export default Component;

