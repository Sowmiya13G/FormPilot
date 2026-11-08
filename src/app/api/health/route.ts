import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import mongoose from 'mongoose';

export async function GET() {
  let dbStatus = 'disconnected';
  let latencyMs = 0;

  try {
    const start = Date.now();
    await connectToDatabase();
    latencyMs = Date.now() - start;

    const state = mongoose.connection.readyState;
    const stateMap: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    dbStatus = stateMap[state] || 'unknown';
  } catch (error) {
    dbStatus = `error: ${error instanceof Error ? error.message : 'failed to connect'}`;
  }

  const isHealthy = dbStatus === 'connected';

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        latencyMs,
      },
      uptime: process.uptime(),
      version: '0.1.0',
    },
    { status: isHealthy ? 200 : 503 }
  );
}

