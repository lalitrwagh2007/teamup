"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Loader2, Save } from "lucide-react";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
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
import UserSkillsManager from "@/components/profile/UserSkillsManager";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getCurrentProfile,
  updateProfile,
  uploadAvatarAction,
  type UpdateProfileState,
} from "@/app/actions/profile";
import type { UserProfile } from "@/types/user";

export default function EditProfilePage() {
  const router = useRouter();

  // ─── Profile data loading ──────────────────────────────────────────────────
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrentProfile().then((result) => {
      if (result.success) {
        setProfile(result.profile);
      } else {
        toast.error(result.message);
        router.push("/login");
      }
      setIsLoading(false);
    });
  }, [router]);

  // ─── Profile save via server action ────────────────────────────────────────
  const [state, formAction, isSaving] = useActionState<UpdateProfileState | null, FormData>(
    async (_prevState, formData) => {
      const interestsRaw = (formData.get("interestsRaw") as string) ?? "";

      // Map field names from the UI to what the server action expects
      const github = formData.get("githubUrl") as string;
      const linkedin = formData.get("linkedinUrl") as string;
      const portfolio = formData.get("portfolioUrl") as string;

      formData.delete("githubUrl");
      formData.delete("linkedinUrl");
      formData.delete("portfolioUrl");

      formData.set("github", github ?? "");
      formData.set("linkedin", linkedin ?? "");
      formData.set("portfolio", portfolio ?? "");

      const result = await updateProfile(null, formData);
      return result;
    },
    null
  );

  // Handle success/error toasts
  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success(state.message ?? "Profile updated!");
      if (state.profile) {
        setProfile(state.profile);
      }
      router.push("/profile");
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  // ─── Avatar upload ─────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, startAvatarUpload] = useTransition();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate client-side for immediate feedback
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5 MB.");
      return;
    }

    // Show local preview immediately
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    // Upload via server action
    startAvatarUpload(async () => {
      const formData = new FormData();
      formData.append("avatar", file);
      const result = await uploadAvatarAction(formData);

      if (result.success) {
        toast.success("Avatar updated!");
        setAvatarPreview(result.avatarUrl);
        setProfile((prev) => (prev ? { ...prev, avatarUrl: result.avatarUrl } : prev));
      } else {
        toast.error(result.message);
        setAvatarPreview(null);
      }
    });
  };

  const displayAvatar = avatarPreview ?? profile?.avatarUrl ?? "";
  const initials = profile?.name
    ? profile.name
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Unable to load profile.</p>
        </main>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────
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

        <form id="edit-profile-form" action={formAction} className="flex flex-col gap-6">

          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
              <CardDescription>
                Click the avatar to upload a new photo. Max 5 MB, JPEG/PNG/WebP/GIF.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="group relative shrink-0"
                  aria-label="Upload avatar"
                >
                  <Avatar className="size-20">
                    <AvatarImage src={displayAvatar} alt={profile.name} />
                    <AvatarFallback className="bg-indigo-100 text-2xl font-semibold text-indigo-700">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    {isUploadingAvatar ? (
                      <Loader2 className="size-5 animate-spin text-white" />
                    ) : (
                      <Camera className="size-5 text-white" />
                    )}
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarChange}
                  className="hidden"
                  aria-hidden
                />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{profile.name || "Your Name"}</p>
                  <p>Click the photo to change your avatar.</p>
                  {isUploadingAvatar && (
                    <p className="mt-1 text-indigo-600">Uploading…</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
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
                    defaultValue={profile.name}
                    placeholder="E.g. Jane Doe"
                    required
                  />
                  {state?.errors?.fullName && (
                    <p className="text-xs text-destructive">{state.errors.fullName[0]}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="location" className="text-sm font-medium">
                    Location
                  </label>
                  <Input
                    id="location"
                    name="location"
                    defaultValue={profile.location}
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
                  defaultValue={profile.bio}
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
                  <Select name="availability" defaultValue={profile.availability || "looking"}>
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
                  <Select name="workMode" defaultValue={profile.workMode || "Remote"}>
                    <SelectTrigger id="workMode">
                      <SelectValue placeholder="Select preferred work mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Remote">Remote only</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="On-site">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">

              <label htmlFor="interestsRaw" className="text-sm font-medium">
                  Interests (comma-separated)
                </label>
                <Input
                  id="interestsRaw"
                  name="interestsRaw"
                  defaultValue={profile.interests.join(", ")}
                  placeholder="E.g. Web3, EdTech, Healthcare"
                />
              </div>
            </CardContent>
          </Card>

          {/* Real User Skills & Proficiency Manager */}
          <UserSkillsManager />

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Links &amp; Portfolio</CardTitle>
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
                  defaultValue={profile.github}
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
                  defaultValue={profile.linkedin}
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
                  defaultValue={profile.portfolio}
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
