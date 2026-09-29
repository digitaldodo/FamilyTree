import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const { mediaFileUrl, accessToken } = await req.json();

    if (!mediaFileUrl || !accessToken) {
      return NextResponse.json(
        { error: 'Missing mediaFileUrl or accessToken' },
        { status: 400 }
      );
    }

    // Download from Google Photos Picker using the access token
    const imageRes = await fetch(mediaFileUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!imageRes.ok) {
      console.error('Failed to download from Google Photos:', await imageRes.text());
      return NextResponse.json(
        { error: 'Failed to download image from Google Photos' },
        { status: imageRes.status }
      );
    }

    const buffer = await imageRes.arrayBuffer();
    
    // Return the image data directly to the client
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': imageRes.headers.get('Content-Type') || 'image/jpeg',
      },
    });
  } catch (error) {
    console.error('Server download error:', error);
    return NextResponse.json(
      { error: 'Failed to process Google Photos download' },
      { status: 500 }
    );
  }
}
