// Prisma Client Singleton
// Prevents multiple Prisma Client instances during Next.js hot reload

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient;

if (globalForPrisma.prisma) {
  prismaInstance = globalForPrisma.prisma;
} else {
  try {
    prismaInstance = new PrismaClient({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    });
  } catch (error) {
    const dummyProxy: any = new Proxy({}, {
      get(target, prop) {
        if (prop === 'then') return undefined; 
        if (prop === '$connect' || prop === '$disconnect') return async () => {};
        if (prop === '$transaction') return async () => [];
        return dummyProxy;
      }
    });
    prismaInstance = dummyProxy as PrismaClient;
  }
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
