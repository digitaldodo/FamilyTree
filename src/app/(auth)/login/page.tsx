"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(
    errorParam ? "An error occurred during authentication. Please try again." : null
  );
  const isRegistered = searchParams.get("registered") === "true";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        if (res.error === "CredentialsSignin") {
           setErrorMsg("Invalid email or password. Please check your credentials.");
        } else {
           setErrorMsg("Unable to sign in. Please try again later.");
        }
        setIsLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setErrorMsg("A network error occurred. Please check your connection.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight mb-2 text-foreground">Welcome back</h2>
        <p className="text-muted-foreground text-base">Sign in to your account to continue your family story.</p>
      </div>

      {isRegistered && !errorMsg && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium leading-relaxed">
            Account created successfully. Please sign in below.
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive-foreground font-medium leading-relaxed">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 flex flex-col" noValidate>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="email">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="pl-10 h-12 bg-background border-border"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isLoading}
              aria-invalid={!!errorMsg}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground" htmlFor="password">Password</label>
            <Link 
              href="/reset-password" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <PasswordInput
              id="password"
              placeholder="Enter your password"
              className="pl-10 h-12 bg-background border-border"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={isLoading}
              aria-invalid={!!errorMsg}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 mt-4 rounded-full text-base font-medium shadow-sm transition-all" 
          disabled={isLoading || !email || !password}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-foreground hover:underline font-medium transition-colors">
          Create an account
        </Link>
      </div>
    </div>
  );
}
