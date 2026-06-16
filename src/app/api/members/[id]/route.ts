import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

// GET /api/members/:id — Get a single member
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  // TODO: Fetch member by ID from database
  return NextResponse.json({ data: null, id, message: 'TODO: Implement' });
}

// PUT /api/members/:id — Update a member
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  // TODO: Validate and update member in database
  return NextResponse.json({ data: body, id, message: 'TODO: Implement' });
}

// DELETE /api/members/:id — Delete a member
export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  // TODO: Delete member from database
  return NextResponse.json({ id, message: 'TODO: Implement' });
}
