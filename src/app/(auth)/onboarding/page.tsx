import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle2, Users, Briefcase, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getCurrentProfile } from "@/app/actions/profile";

export default async function OnboardingPage() {
  const result = await getCurrentProfile();

  if (!result.success) {
    redirect("/login");
  }

  const profile = result.profile;
  const completion = profile.profileCompletion;

  const steps = [
    {
      id: "basics",
      title: "Basic Info",
      description: "Add your name, bio, location, and availability",
      icon: Users,
      completed: !!(profile.name && profile.bio && profile.location),
      href: "/profile/edit",
    },
    {
      id: "skills",
      title: "Skills",
      description: "Add your technical skills with proficiency levels",
      icon: Briefcase,
      completed: (profile.skills?.length ?? 0) > 0,
      href: "/profile/edit",
    },
    {
      id: "links",
      title: "Links",
      description: "Add GitHub, LinkedIn, and portfolio URLs",
      icon: Globe,
      completed: !!(profile.github || profile.linkedin || profile.portfolio),
      href: "/profile/edit",
    },
  ];

  const completedSteps = steps.filter((s) => s.completed).length;

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to TeamUp!</h1>
          <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
            Complete your profile to help teams find you and get better matches.
          </p>
        </div>

<Card className="mb-8">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <Users className="size-5" />
              </div>
              <div>
                <p className="text-lg font-semibold">Profile Completion</p>
                <p className="text-sm text-muted-foreground">
                  {completion}% complete · {completedSteps} of {steps.length} sections done
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
              <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-center text-muted-foreground">
                {completion === 100
                  ? "Your profile is complete! Start exploring teams."
                  : "Complete the sections below to improve your visibility."}
              </p>
            </CardContent>
          </Card>

        <div className="space-y-4">
          {steps.map((step) => (
            <Card key={step.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${
                      step.completed
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="size-6" />
                    ) : (
                      <step.icon className="size-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>

                <Button
                  variant={step.completed ? "outline" : "default"}
                  size="sm"
                  className="shrink-0 gap-1.5"
                  render={<Link href={step.href} />}
                >
                  {step.completed ? (
                    <>
                      <CheckCircle2 className="size-4" />
                      Completed
                    </>
                  ) : (
                    <>
                      Add details
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}

          <div className="text-center text-sm text-muted-foreground">
            <p>You can always edit your profile later from the <Link href="/profile/edit" className="text-indigo-600 hover:underline">profile settings</Link>.</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/teams" className="inline-flex items-center gap-2 text-indigo-600 hover:underline font-medium">
            <ArrowRight className="size-4" />
            Skip for now &rarr; Explore teams
          </Link>
        </div>
      </main>
    </div>
  );
}