import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { APP_VERSION } from '@/utils/constants';
import type { HealthResponse } from '@/types/api';

/** GET /api/health — Health check with database connectivity */
export async function GET() {
  let dbStatus: 'connected' | 'disconnected' = 'disconnected';

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  const response: HealthResponse = {
    status: dbStatus === 'connected' ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    version: APP_VERSION,
  };

  return NextResponse.json(response, {
    status: dbStatus === 'connected' ? 200 : 503,
  });
}
