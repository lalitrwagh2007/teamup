"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Loader2, Save } from "lucide-react";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
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
import UserInterestsManager from "@/components/profile/UserInterestsManager";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  updateProfile,
  uploadAvatarAction,
  type UpdateProfileState,
} from "@/app/actions/profile";

import type { UserProfile } from "@/types/user";

interface EditProfileFormProps {
  profile: UserProfile;
}

export default function EditProfileForm({ profile }: EditProfileFormProps) {
  const router = useRouter();

  // ─── Profile save via server action ──────────────────────────────

  const [state, formAction, isSaving] = useActionState<
    UpdateProfileState | null,
    FormData
  >(async (_prevState, formData) => {
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
  }, null);

  // Handle success/error toasts
  useEffect(() => {
    if (!state) return;

    if (state.success) {
      toast.success(state.message ?? "Profile updated!");
      router.push("/profile");
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  // ─── Avatar upload ────────────────────────────────────────────────

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, startAvatarUpload] = useTransition();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, WebP, or GIF image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5 MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    startAvatarUpload(async () => {
      const formData = new FormData();
      formData.append("avatar", file);

      const result = await uploadAvatarAction(formData);

      if (result.success) {
        toast.success("Avatar updated!");
        setAvatarPreview(result.avatarUrl);

        window.location.reload();
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
              <h1 className="text-2xl font-bold tracking-tight">
                Edit Profile
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Update your personal information, skills, and links.
              </p>
            </div>

            <div className="hidden sm:block">
              <Button
                type="submit"
                form="edit-profile-form"
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save changes
              </Button>
            </div>
          </div>
        </div>

        <form
          id="edit-profile-form"
          action={formAction}
          className="flex flex-col gap-6"
        >
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>

              <CardDescription>
                Click the avatar to upload a new photo. Max 5 MB,
                JPEG/PNG/WebP/GIF.
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
                  <p className="font-medium text-foreground">
                    {profile.name || "Your Name"}
                  </p>

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
                This information will be displayed publicly on your profile
                card.
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
                    <p className="text-xs text-destructive">
                      {state.errors.fullName[0]}
                    </p>
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
                Help teams find you based on your skills and current
                availability.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Availability */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="availability" className="text-sm font-medium">
                    Availability
                  </label>

                  <Select
                    name="availability"
                    defaultValue={profile.availability || "looking"}
                  >
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

                {/* Work Mode */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="workMode" className="text-sm font-medium">
                    Work mode
                  </label>

                  <Select
                    name="workMode"
                    defaultValue={profile.workMode || "Remote"}
                  >
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

                {/* Team Status */}
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label htmlFor="teamStatus" className="text-sm font-medium">
                    Team Status
                  </label>

                  <Select
                    name="teamStatus"
                    defaultValue={profile.teamStatus ?? "finding_team"}
                  >
                    <SelectTrigger id="teamStatus">
                      <SelectValue placeholder="Select team status" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="finding_team">
                        Looking for a Team
                      </SelectItem>

                      <SelectItem value="already_have_team">
                        Already Have a Team
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <p className="text-xs text-muted-foreground">
                    This helps other users understand whether you are currently
                    looking to join a team.
                  </p>

                  {state?.errors?.teamStatus && (
                    <p className="text-xs text-destructive">
                      {state.errors.teamStatus[0]}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real User Skills & Proficiency Manager */}
          <UserSkillsManager />

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

          {/* Mobile Submit Button */}
          <div className="flex justify-end pb-10 sm:hidden">
            <Button type="submit" disabled={isSaving} className="w-full gap-2">
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save changes
            </Button>
          </div>
        </form>

        {/* Interests have their own CRUD actions and must not be nested
            inside the main profile form. */}
        <div className="mt-6">
          <UserInterestsManager />
        </div>
      </main>
    </div>
  );
}
