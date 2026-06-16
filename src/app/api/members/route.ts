import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  successResponse,
  listResponse,
  errorResponse,
  parsePagination,
} from '@/lib/utils';
import { createMemberSchema } from '@/validations/member.schema';
import { getErrorMessage } from '@/utils/helpers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET /api/members — List all members with pagination */
export async function GET(request: NextRequest) {
  try {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(
      request.nextUrl.searchParams,
    );

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          relationsFrom: true,
          relationsTo: true,
        },
      }),
      prisma.member.count(),
    ]);

    return listResponse(members, total, page, limit);
  } catch (error) {
    return errorResponse('FETCH_ERROR', getErrorMessage(error), 500);
  }
}

/** POST /api/members — Create a new member */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createMemberSchema.safeParse(body);

    if (!validation.success) {
      const messages = validation.error.issues
        .map((e) => e.message)
        .join(', ');
      return errorResponse('VALIDATION_ERROR', messages, 400);
    }

    const { treeId, birthDate, deathDate, ...rest } = validation.data;

    // Verify the tree exists
    const tree = await prisma.tree.findUnique({ where: { id: treeId } });
    if (!tree) {
      return errorResponse('NOT_FOUND', 'Tree not found', 404);
    }

    const member = await prisma.member.create({
      data: {
        ...rest,
        birthDate: birthDate ? new Date(birthDate) : null,
        deathDate: deathDate ? new Date(deathDate) : null,
        tree: { connect: { id: treeId } },
      },
    });

    return successResponse(member, 'Member created successfully', 201);
  } catch (error) {
    return errorResponse('CREATE_ERROR', getErrorMessage(error), 500);
  }
}
