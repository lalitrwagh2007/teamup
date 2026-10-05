"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function EditProfilePage() {
  const [isSaving, setIsSaving] = useState(false);

  // Placeholder form handler
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate network request
    setTimeout(() => {
      setIsSaving(false);
      // Would normally redirect or show success toast here
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header & Back link */}
        <div className="mb-6 flex flex-col gap-4">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to profile
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Update your personal information, skills, and links.
              </p>
            </div>
            <div className="hidden sm:block">
              <Button type="submit" form="edit-profile-form" disabled={isSaving} className="gap-2">
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save changes
              </Button>
            </div>
          </div>
        </div>

        <form id="edit-profile-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Basic Info Section */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                This information will be displayed publicly on your profile card.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="fullName" className="text-sm font-medium">
                    Full name
                  </label>
                  <Input
                    id="fullName"
                    name="fullName"
                    defaultValue="Alex Johnson"
                    placeholder="E.g. Jane Doe"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="location" className="text-sm font-medium">
                    Location
                  </label>
                  <Input
                    id="location"
                    name="location"
                    defaultValue="San Francisco, CA"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="bio" className="text-sm font-medium">
                  Bio
                </label>
                <Textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  defaultValue="Full-stack developer passionate about building tools that help communities connect. Constantly learning and exploring new technologies. Love participating in weekend hackathons."
                  placeholder="Tell us a little bit about yourself..."
                />
                <p className="text-xs text-muted-foreground">
                  Brief description for your profile. URLs are hyperlinked.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
              <CardDescription>
                Help teams find you based on your skills and current availability.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="availability" className="text-sm font-medium">
                    Availability
                  </label>
                  <Select name="availability" defaultValue="looking">
                    <SelectTrigger id="availability">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="looking">Looking for team</SelectItem>
                      <SelectItem value="busy">Busy / Not looking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="workMode" className="text-sm font-medium">
                    Work mode
                  </label>
                  <Select name="workMode" defaultValue="remote">
                    <SelectTrigger id="workMode">
                      <SelectValue placeholder="Select preferred work mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote only</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="skills" className="text-sm font-medium">
                  Skills (comma-separated)
                </label>
                <Input
                  id="skills"
                  name="skills"
                  defaultValue="React, TypeScript, Node.js, Figma, Next.js, Tailwind CSS"
                  placeholder="E.g. Python, Machine Learning, UI Design"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="interests" className="text-sm font-medium">
                  Interests (comma-separated)
                </label>
                <Input
                  id="interests"
                  name="interests"
                  defaultValue="Hackathons, Open Source, Climate Tech, AI / ML, Community Building"
                  placeholder="E.g. Web3, EdTech, Healthcare"
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Links & Portfolio</CardTitle>
              <CardDescription>
                Link to your existing work and professional networks.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="githubUrl" className="text-sm font-medium">
                  GitHub URL
                </label>
                <Input
                  id="githubUrl"
                  name="githubUrl"
                  type="url"
                  defaultValue="https://github.com/alexj"
                  placeholder="https://github.com/yourusername"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="linkedinUrl" className="text-sm font-medium">
                  LinkedIn URL
                </label>
                <Input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  type="url"
                  defaultValue="https://linkedin.com/in/alexj"
                  placeholder="https://linkedin.com/in/yourusername"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="portfolioUrl" className="text-sm font-medium">
                  Portfolio / Website URL
                </label>
                <Input
                  id="portfolioUrl"
                  name="portfolioUrl"
                  type="url"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Mobile Submit Button (shows at bottom on small screens) */}
          <div className="flex justify-end sm:hidden pb-10">
            <Button type="submit" disabled={isSaving} className="w-full gap-2">
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save changes
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
