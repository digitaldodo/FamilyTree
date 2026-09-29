"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Mail, Lock, User, Loader2, AlertCircle } from "lucide-react";
import { registerUser } from "./action";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await registerUser(formData);

      if (result.error) {
        setErrorMsg(result.error);
        setIsLoading(false);
      } else if (result.success) {
        // Redirect to login on success, appending a success parameter
        router.push("/login?registered=true");
      }
    } catch {
       setErrorMsg("A network error occurred. Please try again later.");
       setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Create your account</h2>
        <p className="text-muted-foreground text-sm sm:text-base">Start preserving your family story today.</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive-foreground font-medium leading-relaxed">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 flex flex-col" noValidate>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="name">Full Name</label>
          <div className="relative group">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Aarav Sharma"
              className="pl-10 h-12 bg-background border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl transition-all"
              required
              autoComplete="name"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="email">Email address</label>
          <div className="relative group">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="e.g. aarav.sharma@example.com"
              className="pl-10 h-12 bg-background border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl transition-all"
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="password">Password</label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 transition-colors group-focus-within:text-primary" />
            <PasswordInput
              id="password"
              name="password"
              placeholder="Create a strong password"
              className="pl-10 h-12 bg-background border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl transition-all"
              required
              minLength={8}
              autoComplete="new-password"
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-muted-foreground pt-1.5 font-medium">
            Must be at least 8 characters long.
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 mt-2 rounded-xl text-sm font-semibold shadow-sm hover:scale-[1.02] transition-transform" 
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </span>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase font-bold">
          <span className="bg-card px-4 tracking-widest text-muted-foreground/70">OR CONTINUE WITH</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full h-12 rounded-xl text-sm font-semibold transition-all hover:bg-muted border-border/60 shadow-sm"
        onClick={() => {
          setIsLoading(true);
          signIn('google', { callbackUrl: '/dashboard' });
        }}
        disabled={isLoading}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Sign up with Google
      </Button>

      <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:text-primary/80 hover:underline transition-colors">
          Sign in instead
        </Link>
      </div>
    </div>
  );
}
