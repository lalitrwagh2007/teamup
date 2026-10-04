"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

// ─── Google icon ──────────────────────────────────────────────────────────────

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function OrDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground">or continue with</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

// ─── Password requirement row ─────────────────────────────────────────────────

function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      {met ? (
        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
      ) : (
        <Circle className="size-3.5 shrink-0 text-muted-foreground/50" />
      )}
      <span className={met ? "text-emerald-600" : "text-muted-foreground"}>
        {label}
      </span>
    </li>
  );
}

// ─── Password requirements config ────────────────────────────────────────────

const REQUIREMENTS = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  {
    label: "One special character",
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState(false); // show requirements once user starts typing

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;
  const allRequirementsMet = REQUIREMENTS.every(({ test }) => test(password));

  // Placeholder — no real auth yet
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!allRequirementsMet || !passwordsMatch) return;
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      {/* Logo link */}
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-xl font-bold tracking-tight"
        aria-label="TeamUp home"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
          T
        </span>
        Team<span className="text-indigo-600">Up</span>
      </Link>

      <Card className="w-full max-w-md shadow-md">
        {/* Header */}
        <CardHeader className="pb-2 text-center">
          <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
          <CardDescription>
            Join thousands of builders and collaborators on TeamUp
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5 pt-4">
          {/* Google signup button */}
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full gap-2.5 rounded-lg"
          >
            <GoogleIcon className="size-4 shrink-0" />
            Sign up with Google
          </Button>

          <OrDivider />

          {/* Signup form */}
          <form
            id="signup-form"
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-4"
          >
            {/* Full name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="fullName"
                className="text-sm font-medium text-foreground"
              >
                Full name
              </label>
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Alex Johnson"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-10"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setTouched(true);
                  }}
                  required
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>

              {/* Password requirements — shown once user starts typing */}
              {touched && (
                <ul className="mt-1.5 flex flex-col gap-1 rounded-lg border border-border bg-muted/40 p-3 text-xs">
                  {REQUIREMENTS.map(({ label, test }) => (
                    <Requirement
                      key={label}
                      met={test(password)}
                      label={label}
                    />
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-foreground"
              >
                Confirm password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-10 pr-10"
                  aria-invalid={passwordMismatch || undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>

              {/* Match / mismatch feedback */}
              {passwordMismatch && (
                <p className="text-xs text-destructive">
                  Passwords do not match.
                </p>
              )}
              {passwordsMatch && (
                <p className="flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle2 className="size-3.5" />
                  Passwords match
                </p>
              )}
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          {/* Submit */}
          <Button
            type="submit"
            form="signup-form"
            disabled={isLoading}
            className="h-10 w-full rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </Button>

          {/* Terms micro-copy */}
          <p className="text-center text-xs text-muted-foreground">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>

          {/* Login link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
