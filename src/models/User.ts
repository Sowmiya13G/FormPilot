import mongoose, { Schema, Document, Model } from 'mongoose';
import { Role } from '@/types';

export interface IUserDocument extends Document {
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

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'EDITOR', 'VIEWER'],
      default: 'VIEWER',
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    authProvider: {
      type: String,
      default: 'google',
    },
    providerSubject: {
      type: String,
    },
    lastLoginAt: {
      type: Date,
    },
    createdBy: {
      type: String,
      default: 'system',
    },
  },
  {
    timestamps: true,
  }
);

import { createModelProxy } from '@/lib/db/model-proxy';

const RawUser: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export const User: Model<IUserDocument> = createModelProxy<IUserDocument>('users', RawUser);

export default User;

