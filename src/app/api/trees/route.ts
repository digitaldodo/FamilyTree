import { NextRequest, NextResponse } from 'next/server';

// GET /api/trees — List all trees
export async function GET() {
  // TODO: Fetch trees from database via Prisma
  // TODO: Add pagination, filtering
  return NextResponse.json({ data: [], message: 'TODO: Implement' });
}

// POST /api/trees — Create a new tree
export async function POST(request: NextRequest) {
  // TODO: Parse and validate request body
  // TODO: Create tree in database via Prisma
  const body = await request.json();
  return NextResponse.json({ data: body, message: 'TODO: Implement' }, { status: 201 });
}
