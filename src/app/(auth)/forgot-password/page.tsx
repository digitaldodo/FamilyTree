"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Mail, KeyRound, Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { requestPasswordReset, verifyOTP, resetPassword } from "./actions";

type Step = "REQUEST" | "VERIFY" | "RESET" | "SUCCESS";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("REQUEST");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const startCooldown = () => {
    setCooldown(60);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRequestReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (cooldown > 0) return;
    
    setIsLoading(true);
    setErrorMsg(null);

    const res = await requestPasswordReset(email);
    setIsLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setStep("VERIFY");
      startCooldown();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrorMsg("Please enter a valid 6-digit code.");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg(null);

    const res = await verifyOTP(email, otp);
    setIsLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setStep("RESET");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const res = await resetPassword(email, otp, newPassword);
    setIsLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setStep("SUCCESS");
    }
  };

  return (
    <div className="w-full flex flex-col">
      <Link 
        href="/login"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to login
      </Link>

      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight mb-2 text-foreground">
          {step === "REQUEST" && "Forgot Password"}
          {step === "VERIFY" && "Verify Code"}
          {step === "RESET" && "New Password"}
          {step === "SUCCESS" && "Password Reset"}
        </h2>
        <p className="text-muted-foreground text-base">
          {step === "REQUEST" && "Enter your email address and we'll send you a code to reset your password."}
          {step === "VERIFY" && "Enter the 6-digit verification code sent to your email."}
          {step === "RESET" && "Create a new secure password for your account."}
          {step === "SUCCESS" && "Your password has been successfully reset."}
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive-foreground font-medium leading-relaxed">{errorMsg}</p>
        </div>
      )}

      {step === "REQUEST" && (
        <form onSubmit={handleRequestReset} className="space-y-5 flex flex-col" noValidate>
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
                disabled={isLoading}
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 mt-4 rounded-full text-base font-medium shadow-sm" 
            disabled={isLoading || !email}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Send OTP
          </Button>
        </form>
      )}

      {step === "VERIFY" && (
        <form onSubmit={handleVerifyOTP} className="space-y-5 flex flex-col" noValidate>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="otp">Verification Code</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                className="pl-10 h-12 bg-background border-border tracking-widest font-mono text-lg"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                disabled={isLoading}
                maxLength={6}
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 mt-4 rounded-full text-base font-medium shadow-sm" 
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Verify
          </Button>
          
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => handleRequestReset()}
              disabled={isLoading || cooldown > 0}
              className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
            </button>
          </div>
        </form>
      )}

      {step === "RESET" && (
        <form onSubmit={handleResetPassword} className="space-y-5 flex flex-col" noValidate>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="new-password">New Password</label>
            <PasswordInput
              id="new-password"
              placeholder="Enter new password"
              className="h-12 bg-background border-border"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="confirm-password">Confirm Password</label>
            <PasswordInput
              id="confirm-password"
              placeholder="Confirm new password"
              className="h-12 bg-background border-border"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 mt-4 rounded-full text-base font-medium shadow-sm" 
            disabled={isLoading || !newPassword || !confirmPassword}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Reset Password
          </Button>
        </form>
      )}

      {step === "SUCCESS" && (
        <div className="flex flex-col items-center justify-center py-6">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <Button 
            onClick={() => router.push("/login")}
            className="w-full h-12 rounded-full text-base font-medium shadow-sm"
          >
            Return to Sign In
          </Button>
        </div>
      )}

    </div>
  );
}
