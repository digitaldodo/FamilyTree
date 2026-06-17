import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  adapter: PrismaAdapter(prisma as any),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });
        
        if (!user || !user.password) return null;
        
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        
        if (!isPasswordValid) return null;
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        
        // Auto-create user record if it doesn't exist in the database
        // This handles cases where the DB is reset but the NextAuth session cookie persists
        if (session.user.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email: session.user.email }
          });
          
          if (!existingUser) {
            try {
              await prisma.user.create({
                data: {
                  id: token.id as string,
                  email: session.user.email,
                  name: session.user.name || "Restored User",
                  image: session.user.image || null,
                }
              });
            } catch (error) {
              console.error("Failed to auto-create missing user in session callback", error);
            }
          } else if (existingUser.id !== token.id) {
            session.user.id = existingUser.id;
          }
        }
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  }
});
