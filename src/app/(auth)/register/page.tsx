"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
        <h2 className="text-3xl font-semibold tracking-tight mb-2 text-foreground">Create an account</h2>
        <p className="text-muted-foreground text-base">Start preserving your family story today.</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive-foreground font-medium leading-relaxed">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 flex flex-col" noValidate>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="name">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. John Doe"
              className="pl-10 h-12 bg-background border-border"
              required
              autoComplete="name"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="email">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              className="pl-10 h-12 bg-background border-border"
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="password">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <PasswordInput
              id="password"
              name="password"
              placeholder="At least 8 characters"
              className="pl-10 h-12 bg-background border-border"
              required
              minLength={8}
              autoComplete="new-password"
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            Must be at least 8 characters long.
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 mt-4 rounded-full text-base font-medium shadow-sm transition-all" 
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

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground hover:underline font-medium transition-colors">
          Sign in instead
        </Link>
      </div>
    </div>
  );
}
