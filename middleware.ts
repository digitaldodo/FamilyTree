import NextAuth from "next-auth";
import { authConfig } from "./src/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes — they handle their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml
     * - public assets (images, fonts, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
