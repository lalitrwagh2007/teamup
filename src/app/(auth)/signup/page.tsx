"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Users, Loader2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signUpAction, SignupState } from "@/app/actions/auth";

const initialState: SignupState = {
  success: false,
};

export default function SignupPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signUpAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Account created successfully!");
      router.push("/onboarding");
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-indigo-600 hover:text-indigo-700">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Users className="size-6" />
            </div>
            <span>TeamUp</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Connect with builders, form teams, and bring ideas to life.
          </p>
        </div>

        <Card className="border-2 shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold">Create an account</CardTitle>
            <CardDescription>Enter your details below to get started with TeamUp</CardDescription>
          </CardHeader>

          <CardContent>
            <form action={formAction} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
                <Input id="fullName" name="fullName" type="text" placeholder="Aarav Sharma" required disabled={isPending} className="rounded-lg" />
                {state.errors?.fullName && <p className="text-xs font-medium text-destructive">{state.errors.fullName[0]}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email address</label>
                <Input id="email" name="email" type="email" placeholder="aarav@example.com" required disabled={isPending} className="rounded-lg" />
                {state.errors?.email && <p className="text-xs font-medium text-destructive">{state.errors.email[0]}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</label>
                <Input id="password" name="password" type="password" placeholder="••••••••" required disabled={isPending} className="rounded-lg" />
                {state.errors?.password && <p className="text-xs font-medium text-destructive">{state.errors.password[0]}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm Password</label>
                <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" required disabled={isPending} className="rounded-lg" />
                {state.errors?.confirmPassword && <p className="text-xs font-medium text-destructive">{state.errors.confirmPassword[0]}</p>}
              </div>

              <Button type="submit" disabled={isPending} className="w-full gap-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Sign up
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-indigo-600 hover:underline">Log in</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}

