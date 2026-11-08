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

