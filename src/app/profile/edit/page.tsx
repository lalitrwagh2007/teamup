import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/app/actions/profile";
import EditProfileForm from "@/components/profile/EditProfileForm";

import type { UserProfile } from "@/types/user";

export default async function EditProfilePage() {
  const result = await getCurrentProfile();

  if (!result.success) {
    if (result.message.includes("logged in") || result.message.includes("logged in")) {
      redirect("/login");
    }

    console.error("Failed to load profile:", result.message);

    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Unable to load profile</h1>
            <p className="mt-2 text-muted-foreground">{result.message}</p>
            <p className="mt-4">
              <a href="/profile/edit" className="text-indigo-600 hover:underline">
                Try again
              </a>
            </p>
          </div>
        </main>
      </div>
    );
  }

  const profile: UserProfile = result.profile;

  return <EditProfileForm profile={profile} />;
}