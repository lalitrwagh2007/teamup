"use server";

import { createClient } from "@/lib/supabase/server";
import { updateProfileSchema, type UpdateProfileInput } from "@/validations/profile.schema";
import type { UserProfile } from "@/types/user";
import { BUCKETS } from "@/lib/supabase/storage";

// ─── Result types ───────────────────────────────────────────────────────────

export type ProfileResult =
  | { success: true; profile: UserProfile }
  | { success: false; message: string };

export type UpdateProfileState = {
  success: boolean;
  message?: string;
  profile?: UserProfile;
  errors?: Partial<Record<keyof UpdateProfileInput, string[]>>;
};

export type UploadAvatarResult =
  | { success: true; avatarUrl: string }
  | { success: false; message: string };

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Compute a rough profile-completion percentage based on filled fields. */
function computeCompletion(profile: {
  full_name: string | null;
  username: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  availability: string | null;
  work_mode: string | null;
  github: string | null;
  linkedin: string | null;
  portfolio: string | null;
  skills: string[];
  interests: string[];
}): number {
  const checks = [
    !!profile.full_name,
    !!profile.username,
    !!profile.bio,
    !!profile.location,
    !!profile.avatar_url,
    !!profile.availability,
    !!profile.work_mode,
    !!profile.github || !!profile.linkedin || !!profile.portfolio,
    profile.skills.length > 0,
    profile.interests.length > 0,
  ];

  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

/** Map a DB profile row + skills/interests arrays into the UserProfile type. */
function toUserProfile(
  row: {
    id: string;
    full_name: string | null;
    username: string | null;
    bio: string | null;
    location: string | null;
    avatar_url: string | null;
    availability: string | null;
    work_mode: string | null;
    github: string | null;
    linkedin: string | null;
    portfolio: string | null;
  },
  skills: string[],
  interests: string[]
): UserProfile {
  return {
    id: row.id,
    name: row.full_name ?? "",
    username: row.username ?? "",
    bio: row.bio ?? "",
    location: row.location ?? "",
    avatarUrl: row.avatar_url ?? "",
    availability: row.availability ?? "",
    workMode: (row.work_mode as UserProfile["workMode"]) ?? "Remote",
    github: row.github ?? "",
    linkedin: row.linkedin ?? "",
    portfolio: row.portfolio ?? "",
    skills,
    interests,
    profileCompletion: computeCompletion({ ...row, skills, interests }),
  };
}

// ─── getCurrentProfile ──────────────────────────────────────────────────────

/**
 * Retrieves the authenticated user's profile, including their skills and
 * interests resolved from the junction tables.
 *
 * Ownership is enforced by using the authenticated user's `auth.uid()` —
 * no user ID parameter is accepted.
 */
export async function getCurrentProfile(): Promise<ProfileResult> {
  try {
    const supabase = await createClient();

    // 1. Authenticate — never trust a client-supplied ID
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "You must be logged in to view your profile." };
    }

    // 2. Fetch the profile row
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, message: "Profile not found." };
    }

    // 3. Fetch the user's skills (via junction table)
    const { data: userSkills } = await supabase
      .from("user_skills")
      .select("skill_id, skills(name)")
      .eq("user_id", user.id);

    const skills: string[] = (userSkills ?? [])
      .map((row: Record<string, unknown>) => {
        const s = row.skills as { name: string } | null;
        return s?.name ?? null;
      })
      .filter((name): name is string => name !== null);

    // 4. Fetch the user's interests (via junction table)
    const { data: userInterests } = await supabase
      .from("user_interests")
      .select("interest_id, interests(name)")
      .eq("user_id", user.id);

    const interests: string[] = (userInterests ?? [])
      .map((row: Record<string, unknown>) => {
        const i = row.interests as { name: string } | null;
        return i?.name ?? null;
      })
      .filter((name): name is string => name !== null);

    // 5. Map to the UserProfile type
    return { success: true, profile: toUserProfile(profile, skills, interests) };
  } catch {
    return { success: false, message: "An unexpected error occurred. Please try again later." };
  }
}

// ─── updateProfile ──────────────────────────────────────────────────────────

/**
 * Updates the authenticated user's profile.
 *
 * Ownership is enforced by scoping the update to `auth.uid()`. The user
 * can never supply a target user ID — it is always derived from the
 * authenticated session.
 *
 * Skills and interests are synced via a delete-and-reinsert strategy on
 * the junction tables, within the same request.
 */
export async function updateProfile(
  _prevState: UpdateProfileState | null,
  formData: FormData
): Promise<UpdateProfileState> {
  try {
    const supabase = await createClient();

    // 1. Authenticate
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "You must be logged in to update your profile." };
    }

    // 2. Parse & validate input
    const rawData = {
      fullName: formData.get("fullName") as string,
      username: (formData.get("username") as string) || undefined,
      bio: (formData.get("bio") as string) || undefined,
      location: (formData.get("location") as string) || undefined,
      availability: (formData.get("availability") as string) || undefined,
      workMode: (formData.get("workMode") as string) || undefined,
      github: (formData.get("github") as string) || undefined,
      linkedin: (formData.get("linkedin") as string) || undefined,
      portfolio: (formData.get("portfolio") as string) || undefined,
      skills: formData.getAll("skills").map(String).filter(Boolean),
      interests: formData.getAll("interests").map(String).filter(Boolean),
    };

    const validation = updateProfileSchema.safeParse(rawData);

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Please fix the errors in the form.",
        errors: fieldErrors as Partial<Record<keyof UpdateProfileInput, string[]>>,
      };
    }

    const { fullName, username, bio, location, availability, workMode, github, linkedin, portfolio, skills, interests } =
      validation.data;

    // 3. Update the profiles row — scoped to the authenticated user's ID
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        username: username || null,
        bio: bio || null,
        location: location || null,
        availability: availability || null,
        work_mode: workMode ?? null,
        github: github || null,
        linkedin: linkedin || null,
        portfolio: portfolio || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      // Handle unique constraint on username
      if (updateError.code === "23505" && updateError.message?.includes("username")) {
        return {
          success: false,
          message: "This username is already taken.",
          errors: { username: ["This username is already taken."] },
        };
      }
      return { success: false, message: "Failed to update profile. Please try again." };
    }

    // 4. Sync skills — delete existing, then insert new ones
    await supabase.from("user_skills").delete().eq("user_id", user.id);

    if (skills.length > 0) {
      // Upsert skill names into the skills table, then link them
      for (const skillName of skills) {
        // Get or create the skill
        const { data: existingSkill } = await supabase
          .from("skills")
          .select("id")
          .eq("name", skillName)
          .single();

        let skillId: string;
        if (existingSkill) {
          skillId = existingSkill.id;
        } else {
          const { data: newSkill } = await supabase
            .from("skills")
            .insert({ name: skillName })
            .select("id")
            .single();
          if (!newSkill) continue;
          skillId = newSkill.id;
        }

        await supabase.from("user_skills").insert({
          user_id: user.id,
          skill_id: skillId,
        });
      }
    }

    // 5. Sync interests — delete existing, then insert new ones
    await supabase.from("user_interests").delete().eq("user_id", user.id);

    if (interests.length > 0) {
      for (const interestName of interests) {
        const { data: existingInterest } = await supabase
          .from("interests")
          .select("id")
          .eq("name", interestName)
          .single();

        let interestId: string;
        if (existingInterest) {
          interestId = existingInterest.id;
        } else {
          const { data: newInterest } = await supabase
            .from("interests")
            .insert({ name: interestName })
            .select("id")
            .single();
          if (!newInterest) continue;
          interestId = newInterest.id;
        }

        await supabase.from("user_interests").insert({
          user_id: user.id,
          interest_id: interestId,
        });
      }
    }

    // 6. Re-fetch the full profile to return updated data
    const result = await getCurrentProfile();
    if (!result.success) {
      return { success: false, message: result.message };
    }

    return {
      success: true,
      message: "Profile updated successfully!",
      profile: result.profile,
    };
  } catch {
    return { success: false, message: "An unexpected error occurred. Please try again later." };
  }
}

// ─── uploadAvatarAction ─────────────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Uploads an avatar image for the authenticated user.
 *
 * Ownership is enforced: the file is stored under `profiles/{auth.uid()}/avatar`
 * and the avatar_url is only updated on the user's own profile row.
 */
export async function uploadAvatarAction(formData: FormData): Promise<UploadAvatarResult> {
  try {
    const supabase = await createClient();

    // 1. Authenticate
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "You must be logged in to upload an avatar." };
    }

    // 2. Validate the file
    const file = formData.get("avatar") as File | null;

    if (!file || file.size === 0) {
      return { success: false, message: "No file selected." };
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { success: false, message: "Please upload a JPEG, PNG, WebP, or GIF image." };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { success: false, message: "File size must be under 5 MB." };
    }

    // 3. Upload to Supabase Storage — scoped to this user's folder
    const fileExt = file.name.split(".").pop() ?? "jpg";
    const filePath = `profiles/${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKETS.AVATARS)
      .upload(filePath, file, {
        upsert: true,
        cacheControl: "3600",
      });

    if (uploadError) {
      return { success: false, message: "Failed to upload avatar. Please try again." };
    }

    // 4. Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKETS.AVATARS)
      .getPublicUrl(filePath);

    const avatarUrl = publicUrlData.publicUrl;

    // 5. Update the profile row — scoped to auth.uid()
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (updateError) {
      return { success: false, message: "Avatar uploaded but failed to update profile." };
    }

    return { success: true, avatarUrl };
  } catch {
    return { success: false, message: "An unexpected error occurred. Please try again later." };
  }
}
