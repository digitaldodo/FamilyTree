import { NextRequest, NextResponse } from 'next/server';

// GET /api/members — List all members
export async function GET() {
  // TODO: Fetch members from database via Prisma
  // TODO: Add pagination, filtering, sorting
  return NextResponse.json({ data: [], message: 'TODO: Implement' });
}

// POST /api/members — Create a new member
export async function POST(request: NextRequest) {
  // TODO: Parse and validate request body
  // TODO: Create member in database via Prisma
  // TODO: Return created member
  const body = await request.json();
  return NextResponse.json({ data: body, message: 'TODO: Implement' }, { status: 201 });
}
