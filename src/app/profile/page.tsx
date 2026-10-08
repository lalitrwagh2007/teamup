import Link from "next/link";
import { Briefcase, Edit, ExternalLink, Code, Globe, Users } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ProfileCard, { type AvailabilityStatus } from "@/components/profile/ProfileCard";
import SkillTags from "@/components/profile/SkillTags";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/app/actions/profile";
import { redirect } from "next/navigation";

// ─── Helpers ────────────────────────────────────────────────────────────────

const VALID_AVAILABILITY: AvailabilityStatus[] = ["Available", "Busy", "Looking for team"];

function parseAvailability(val: string | null | undefined): AvailabilityStatus {
  if (val && VALID_AVAILABILITY.includes(val as AvailabilityStatus)) {
    return val as AvailabilityStatus;
  }
  return "Looking for team";
}

// ─── Static experience data (not stored in profiles table) ───────────────────

const MOCK_EXPERIENCE = [
  {
    id: 1,
    title: "Frontend Developer",
    organization: "TechNova Solutions",
    duration: "Jan 2024 - Present",
    description:
      "Building responsive web applications using React and Next.js. Improved core web vitals and overall performance by 30%.",
  },
  {
    id: 2,
    title: "Open Source Contributor",
    organization: "Various Projects",
    duration: "2023 - Present",
    description:
      "Contributed to multiple popular open-source repositories by fixing bugs, improving documentation, and adding new UI components.",
  },
];

// ─── Page Component ──────────────────────────────────────────────────────────

export default async function ProfilePage() {
  const result = await getCurrentProfile();

  if (!result.success) {
    redirect("/login");
  }

  const profile = result.profile;

  const profileCardData = {
    name: profile.name || "Unnamed User",
    avatarUrl: profile.avatarUrl || "",
    bio: profile.bio || "No bio yet.",
    location: profile.location || "Not specified",
    skills: profile.skills,
    availability: parseAvailability(profile.availability),
    completionPercentage: profile.profileCompletion,
  };

  const links = {
    github: profile.github,
    linkedin: profile.linkedin,
    portfolio: profile.portfolio,
  };

  const hasLinks = links.github || links.linkedin || links.portfolio;


  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <Button className="gap-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700" render={<Link href="/profile/edit" />}>
            <Edit className="size-4" />
            Edit Profile
          </Button>
        </div>

        {/* Main Layout Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Left Column: Profile Card */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <ProfileCard profile={profileCardData} />


            {/* Social / Portfolio Links Card */}
            {hasLinks && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Links</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {links.github && (
                    <Button variant="outline" className="w-full justify-start gap-3 rounded-lg" render={<a href={links.github} target="_blank" rel="noreferrer" />}>
                      <Code className="size-4 text-muted-foreground" />
                      GitHub
                    </Button>
                  )}
                  {links.linkedin && (
                    <Button variant="outline" className="w-full justify-start gap-3 rounded-lg" render={<a href={links.linkedin} target="_blank" rel="noreferrer" />}>
                      <Users className="size-4 text-muted-foreground" />
                      LinkedIn
                    </Button>
                  )}
                  {links.portfolio && (
                    <Button variant="outline" className="w-full justify-start gap-3 rounded-lg" render={<a href={links.portfolio} target="_blank" rel="noreferrer" />}>
                      <Globe className="size-4 text-muted-foreground" />
                      Portfolio
                      <ExternalLink className="ml-auto size-3.5 text-muted-foreground opacity-50" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Experience & Interests */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            
            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Experience</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                {MOCK_EXPERIENCE.map((exp, index) => (
                  <div key={exp.id} className="relative pl-6">
                    {/* Timeline line */}
                    {index !== MOCK_EXPERIENCE.length - 1 && (
                      <div className="absolute left-[11px] top-7 h-full w-px bg-border" />
                    )}
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-1.5 flex size-6 items-center justify-center rounded-full border border-border bg-card">
                      <Briefcase className="size-3 text-muted-foreground" />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <h3 className="font-semibold text-foreground">{exp.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                        <span className="font-medium text-indigo-600">
                          {exp.organization}
                        </span>
                        <span>•</span>
                        <span>{exp.duration}</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {exp.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Interests */}
            {profile.interests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <SkillTags skills={profile.interests} />
                </CardContent>
              </Card>
            )}


          </div>
        </div>
      </main>
    </div>
  );
}
