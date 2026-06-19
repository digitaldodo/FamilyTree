import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Metadata } from 'next';

/**
 * Utility to merge tailwind classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function successResponse(data: any, message = 'Success', status = 200) {
  return Response.json({ success: true, message, data }, { status });
}

export function constructMetadata({
  title = "FamilyTree - Uncover Your Ancestry",
  description = "A modern, beautiful SaaS platform to build, visualize, and share your family history with ease.",
  image = "/globe.svg",
  icons = "/favicon.ico",
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
} = {}): Metadata {
  const meta: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
    },
    icons,
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  };

  return meta;
}

export function errorResponse(messageOrCode: string = 'An error occurred', detailsOrMessage?: any, statusOrStatus?: any) {
  let message = messageOrCode;
  let status = 400;
  let errors = undefined;

  if (typeof statusOrStatus === 'number') {
    status = statusOrStatus;
    message = typeof detailsOrMessage === 'string' ? detailsOrMessage : messageOrCode;
    errors = typeof detailsOrMessage !== 'string' ? detailsOrMessage : undefined;
  } else if (typeof detailsOrMessage === 'number') {
    status = detailsOrMessage;
  } else {
    errors = detailsOrMessage;
  }

  return Response.json({ success: false, message, errors }, { status });
}

export function listResponse(data: any[], totalOrMeta?: number | any, page?: number, limit?: number) {
  const meta = typeof totalOrMeta === 'number' ? { total: totalOrMeta, page, limit } : totalOrMeta;
  return Response.json({ success: true, data, meta }, { status: 200 });
}

export function parsePagination(searchParams: URLSearchParams) {
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  return {
    page: page > 0 ? page : 1,
    limit: limit > 0 && limit <= 100 ? limit : 10,
    skip: (page - 1) * limit,
    sortBy,
    sortOrder
  };
}
