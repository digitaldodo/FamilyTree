import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWAConfig = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
});

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  experimental: {
    cssChunking: 'strict',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  turbopack: {},
};

export default withPWAConfig(nextConfig);
