declare module "next-auth/react" {
  export function signIn(provider?: string, options?: any, authorizationParams?: any): Promise<any>;
  export function signOut(options?: any): Promise<any>;
  export function useSession(options?: any): any;
  export function getSession(options?: any): Promise<any>;
  export function getCsrfToken(options?: any): Promise<any>;
  export function getProviders(): Promise<any>;
  export const SessionProvider: any;
}

declare module "next-auth" {
  export type NextAuthConfig = any;
  export type User = any;
  export type Session = any;
  const NextAuth: any;
  export default NextAuth;
}
