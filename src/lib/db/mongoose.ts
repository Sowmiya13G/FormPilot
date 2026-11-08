import mongoose from 'mongoose';
import { isLocalMode } from './config';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/formpilot_db';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  // In local data mode, bypass MongoDB connection entirely
  if (isLocalMode()) {
    return mongoose;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 3000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.warn(
      '⚠️ MongoDB connection failed. Falling back to local data mode (./data/*.json). Error:',
      (e as Error).message
    );
    return mongoose;
  }

  return cached.conn;
}

export default connectToDatabase;
