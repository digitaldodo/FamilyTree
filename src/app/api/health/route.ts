import { NextResponse } from 'next/server';

// Health Check Endpoint
// GET /api/health
export async function GET() {
  // TODO: Add database connectivity check
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
