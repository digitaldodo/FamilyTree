import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

// GET /api/trees/:id — Get a single tree
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  // TODO: Fetch tree by ID with members and relationships
  return NextResponse.json({ data: null, id, message: 'TODO: Implement' });
}

// PUT /api/trees/:id — Update a tree
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  // TODO: Validate and update tree in database
  return NextResponse.json({ data: body, id, message: 'TODO: Implement' });
}

// DELETE /api/trees/:id — Delete a tree
export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  // TODO: Delete tree and cascade to members/relationships
  return NextResponse.json({ id, message: 'TODO: Implement' });
}
