import Link from "next/link";
import { Briefcase, Edit, ExternalLink, Code, Globe, Users } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ProfileCard, { ProfileData } from "@/components/profile/ProfileCard";
import SkillTags from "@/components/profile/SkillTags";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_PROFILE: ProfileData = {
  name: "Alex Johnson",
  avatarUrl: "",
  bio: "Full-stack developer passionate about building tools that help communities connect. Constantly learning and exploring new technologies. Love participating in weekend hackathons.",
  location: "San Francisco, CA",
  skills: ["React", "TypeScript", "Node.js", "Figma", "Next.js", "Tailwind CSS"],
  availability: "Looking for team",
  completionPercentage: 85,
};

const MOCK_INTERESTS = [
  "Hackathons",
  "Open Source",
  "Climate Tech",
  "AI / ML",
  "Community Building",
];

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

const MOCK_LINKS = {
  github: "https://github.com",
  linkedin: "https://linkedin.com",
  portfolio: "https://example.com",
};

// ─── Page Component ──────────────────────────────────────────────────────────

export default function ProfilePage() {
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
            <ProfileCard profile={MOCK_PROFILE} />

            {/* Social / Portfolio Links Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Links</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button variant="outline" className="w-full justify-start gap-3 rounded-lg" render={<a href={MOCK_LINKS.github} target="_blank" rel="noreferrer" />}>
                  <Code className="size-4 text-muted-foreground" />
                  GitHub
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 rounded-lg" render={<a href={MOCK_LINKS.linkedin} target="_blank" rel="noreferrer" />}>
                  <Users className="size-4 text-muted-foreground" />
                  LinkedIn
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 rounded-lg" render={<a href={MOCK_LINKS.portfolio} target="_blank" rel="noreferrer" />}>
                  <Globe className="size-4 text-muted-foreground" />
                  Portfolio
                  <ExternalLink className="ml-auto size-3.5 text-muted-foreground opacity-50" />
                </Button>
              </CardContent>
            </Card>
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Interests</CardTitle>
              </CardHeader>
              <CardContent>
                {/* We reuse SkillTags for interests since visually they are the same (pill badges) */}
                <SkillTags skills={MOCK_INTERESTS} />
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}
