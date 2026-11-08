export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface IUser {
  _id: string;
  email: string;
  name: string;
  image?: string;
  role: Role;
  active: boolean;
  authProvider: string;
  providerSubject?: string;
  lastLoginAt?: Date;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: Role;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
  message?: string;
}

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
  maxFileSize?: number;
  allowedFileTypes?: string[];
}

export interface IComponent {
  _id: string;
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
