import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  successResponse,
  listResponse,
  errorResponse,
  parsePagination,
} from '@/lib/utils';
import { createTreeSchema } from '@/validations/tree.schema';
import { getErrorMessage } from '@/utils/helpers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET /api/trees — List all trees with pagination */
export async function GET(request: NextRequest) {
  try {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(
      request.nextUrl.searchParams,
    );

    const [trees, total] = await Promise.all([
      prisma.tree.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: { select: { members: true } },
          owner: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.tree.count(),
    ]);

    return listResponse(trees, total, page, limit);
  } catch (error) {
    return errorResponse('FETCH_ERROR', getErrorMessage(error), 500);
  }
}

/** POST /api/trees — Create a new tree */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createTreeSchema.safeParse(body);

    if (!validation.success) {
      const messages = validation.error.issues
        .map((e) => e.message)
        .join(', ');
      return errorResponse('VALIDATION_ERROR', messages, 400);
    }

    const { ownerId, ...rest } = validation.data;

    // Verify owner exists
    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner) {
      return errorResponse('NOT_FOUND', 'Owner user not found', 404);
    }

    const tree = await prisma.tree.create({
      data: {
        ...rest,
        owner: { connect: { id: ownerId } },
      },
      include: {
        _count: { select: { members: true } },
      },
    });

    return successResponse(tree, 'Tree created successfully', 201);
  } catch (error) {
    return errorResponse('CREATE_ERROR', getErrorMessage(error), 500);
  }
}
