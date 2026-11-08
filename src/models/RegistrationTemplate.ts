import mongoose, { Schema, Document, Model } from 'mongoose';

export type TemplateStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type ConditionOperator =
  | 'equals'
  | 'notEquals'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'greaterThan'
  | 'lessThan'
  | 'contains';

export interface IConditionRule {
  fieldKey: string;
  operator: ConditionOperator;
  value?: unknown;
}

export interface IConditionalConfig {
  action: 'show' | 'hide';
  matchType: 'all' | 'any';
  rules: IConditionRule[];
}

export interface ITemplateField {
  componentKey: string;
  fieldKey: string;
  label?: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  order: number;
  width?: 'full' | 'half' | 'third';
  conditionalConfig?: IConditionalConfig;
  validationOverride?: Record<string, unknown>;
}

export interface IThemeConfig {
  primaryColor?: string; // hex, e.g. #2563eb
  backgroundColor?: string;
  backgroundImageUrl?: string;
  bannerImageUrl?: string;
  logoUrl?: string;
  fontFamily?: string;
}

export interface IRegistrationTemplateDocument extends Document {
  eventName: string;
  slug: string;
  description?: string;
  status: TemplateStatus;
  version: number;
  fields: ITemplateField[];
  theme: IThemeConfig;
  allowedOrigins?: string[];
  driveFolderId?: string;
  spreadsheetId?: string;
  sheetTabId?: string;
  sheetMapping?: Record<string, string>; // fieldKey -> Sheet column header
  createdBy?: string;
  updatedBy?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConditionRuleSchema = new Schema<IConditionRule>(
  {
    fieldKey: { type: String, required: true },
    operator: {
      type: String,
      required: true,
      enum: ['equals', 'notEquals', 'isEmpty', 'isNotEmpty', 'greaterThan', 'lessThan', 'contains'],
    },
    value: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const ConditionalConfigSchema = new Schema<IConditionalConfig>(
  {
    action: { type: String, required: true, enum: ['show', 'hide'], default: 'show' },
    matchType: { type: String, required: true, enum: ['all', 'any'], default: 'all' },
    rules: { type: [ConditionRuleSchema], default: [] },
  },
  { _id: false }
);

const TemplateFieldSchema = new Schema<ITemplateField>(
  {
    componentKey: { type: String, required: true },
    fieldKey: { type: String, required: true },
    label: { type: String },
    placeholder: { type: String },
    helpText: { type: String },
    required: { type: Boolean },
    order: { type: Number, required: true, default: 0 },
    width: { type: String, enum: ['full', 'half', 'third'], default: 'full' },
    conditionalConfig: { type: ConditionalConfigSchema },
    validationOverride: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const ThemeConfigSchema = new Schema<IThemeConfig>(
  {
    primaryColor: { type: String, default: '#2563eb' },
    backgroundColor: { type: String, default: '#ffffff' },
    backgroundImageUrl: { type: String },
    bannerImageUrl: { type: String },
    logoUrl: { type: String },
    fontFamily: { type: String, default: 'Inter, sans-serif' },
  },
  { _id: false }
);

const RegistrationTemplateSchema = new Schema<IRegistrationTemplateDocument>(
  {
    eventName: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'DRAFT',
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    fields: {
      type: [TemplateFieldSchema],
      default: [],
    },
    theme: {
      type: ThemeConfigSchema,
      default: () => ({}),
    },
    allowedOrigins: {
      type: [String],
      default: [],
    },
    driveFolderId: {
      type: String,
    },
    spreadsheetId: {
      type: String,
    },
    sheetTabId: {
      type: String,
      default: 'Registrations',
    },
    sheetMapping: {
      type: Map,
      of: String,
      default: () => new Map(),
    },
    createdBy: {
      type: String,
    },
    updatedBy: {
      type: String,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const RegistrationTemplate: Model<IRegistrationTemplateDocument> =
  mongoose.models.RegistrationTemplate ||
  mongoose.model<IRegistrationTemplateDocument>('RegistrationTemplate', RegistrationTemplateSchema);

export default RegistrationTemplate;

