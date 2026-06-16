import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }: { auth: any, request: any }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Protected routes — require authentication
      const protectedPrefixes = ['/dashboard', '/profile', '/settings', '/admin', '/tree', '/members'];
      const isProtected = protectedPrefixes.some(prefix => pathname.startsWith(prefix));
      
      // Public routes — accessible without auth
      const publicPrefixes = ['/public/', '/invite/'];
      const isPublicRoute = publicPrefixes.some(prefix => pathname.startsWith(prefix));
      
      if (isPublicRoute) {
        return true;
      }

      if (isProtected) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && (pathname === "/login" || pathname === "/register" || pathname === "/")) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
  providers: [], // Providers configured in auth.ts
} satisfies NextAuthConfig;
