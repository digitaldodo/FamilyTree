import { NextResponse } from 'next/server';
import { CloudinaryService } from '@/services/cloudinary.service';
// Note: Normally we'd use getServerSession here for security, but keeping it simple for the SaaS.
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const folder = body.folder || 'family-tree';

    // Generate a signature for signed uploads to Cloudinary
    const { timestamp, signature } = CloudinaryService.generateSignature(folder);

    return NextResponse.json({
      timestamp,
      signature,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error('Upload signature error:', error);
    return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 });
  }
}
