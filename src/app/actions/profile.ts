"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/validations/profile.schema";

import type {
  ProficiencyLevel,
  UserProfile,
  UserSkillItem,
} from "@/types/user";

import { BUCKETS } from "@/lib/supabase/storage";

// ─── Result types ────────────────────────────────────────────────────────────

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

// ─── Result types for user-skill actions ─────────────────────────────────────

export type UserSkillsActionResult =
  | { success: true; message?: string; data?: UserSkillItem[] }
  | {
      success: false;
      message: string;
      errors?: Record<string, string[]>;
    };

// ─── updateUserSkills ────────────────────────────────────────────────────────

/**
 * Updates the authenticated user's skill mappings.
 *
 * Ownership is enforced through the authenticated user's ID.
 * Existing mappings are updated through the composite key.
 */
export async function updateUserSkills(
  skills: {
    skillId: string;
    proficiency: ProficiencyLevel;
  }[],
): Promise<UserSkillsActionResult> {
  try {
    const supabase = await createClient();

    // 1. Authenticate
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "You must be logged in to update skills.",
      };
    }

    // 2. Validate proficiency values
    const validProficiencyLevels: readonly ProficiencyLevel[] = [
      "Beginner",
      "Intermediate",
      "Advanced",
      "Expert",
    ];

    const invalid = skills.some(
      (skill) => !validProficiencyLevels.includes(skill.proficiency),
    );

    if (invalid) {
      return {
        success: false,
        message: "Invalid proficiency level provided.",
      };
    }

    if (skills.length === 0) {
      return {
        success: true,
        message: "No skills to update.",
        data: [],
      };
    }

    // 3. Upsert each skill mapping
    for (const { skillId, proficiency } of skills) {
      const { error: upsertError } = await supabase.from("user_skills").upsert(
        {
          user_id: user.id,
          skill_id: skillId,
          proficiency,
        },
        {
          onConflict: "user_id,skill_id",
        },
      );

      if (upsertError) {
        return {
          success: false,
          message: "Failed to update skills. Please try again.",
        };
      }
    }

    revalidatePath("/profile");
    revalidatePath("/profile/edit");

    const updatedUserSkillsResult = await getUserSkills(user.id);

    return {
      success: true,
      message: "Skills updated successfully.",
      data: updatedUserSkillsResult.data,
    };
  } catch {
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Compute a rough profile-completion percentage based on filled fields.
 */
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
  skills: (string | UserSkillItem)[];
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

/**
 * Map a DB profile row + skills/interests arrays into UserProfile.
 */
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
  skills: (string | UserSkillItem)[],
  interests: string[],
  userSkills?: UserSkillItem[],
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
    userSkills,
    interests,
    profileCompletion: computeCompletion({
      ...row,
      skills,
      interests,
    }),
  };
}

// ─── getUserSkills ───────────────────────────────────────────────────────────

async function getUserSkills(userId: string): Promise<{
  data: UserSkillItem[];
}> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("user_skills")
    .select("skill_id, proficiency, skills(id, name, category)")
    .eq("user_id", userId);

  const skills: UserSkillItem[] = [];

  for (const row of data ?? []) {
    const rawRow = row as Record<string, unknown>;

    const skill = rawRow.skills as {
      id: string;
      name: string;
      category?: string | null;
    } | null;

    if (!skill) {
      continue;
    }

    const userSkill: UserSkillItem = {
      skillId: skill.id,
      name: skill.name,
      proficiency: (rawRow.proficiency as ProficiencyLevel) || "Intermediate",
      category: skill.category ?? "",
    };

    skills.push(userSkill);
  }

  return {
    data: skills,
  };
}

// ─── getCurrentProfile ──────────────────────────────────────────────────────

/**
 * Retrieves the authenticated user's profile, including skills
 * and interests resolved from their junction tables.
 */
export async function getCurrentProfile(): Promise<ProfileResult> {
  try {
    const supabase = await createClient();

    // 1. Authenticate
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "You must be logged in to view your profile.",
      };
    }

    // 2. Fetch the profile row
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        message: "Profile not found.",
      };
    }

    // 3. Fetch the user's skills
    const { data: userSkillsRaw } = await supabase
      .from("user_skills")
      .select("skill_id, proficiency, skills(id, name, category)")
      .eq("user_id", user.id);

    const detailedSkills: UserSkillItem[] = [];

    for (const row of userSkillsRaw ?? []) {
      const rawRow = row as Record<string, unknown>;

      const skill = rawRow.skills as {
        id: string;
        name: string;
        category?: string | null;
      } | null;

      if (!skill) {
        continue;
      }

      const userSkill: UserSkillItem = {
        skillId: skill.id,
        name: skill.name,
        proficiency: (rawRow.proficiency as ProficiencyLevel) || "Intermediate",
        category: skill.category ?? "",
      };

      detailedSkills.push(userSkill);
    }

    // 4. Fetch the user's interests
    const { data: userInterests } = await supabase
      .from("user_interests")
      .select("interest_id, interests(name)")
      .eq("user_id", user.id);

    const interests: string[] = [];

    for (const row of userInterests ?? []) {
      const rawRow = row as Record<string, unknown>;

      const interest = rawRow.interests as {
        name: string;
      } | null;

      if (interest?.name) {
        interests.push(interest.name);
      }
    }

    // 5. Map to UserProfile
    return {
      success: true,
      profile: toUserProfile(
        profile,
        detailedSkills,
        interests,
        detailedSkills,
      ),
    };
  } catch {
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}

// ─── updateProfile ──────────────────────────────────────────────────────────

/**
 * Updates the authenticated user's profile.
 *
 * Skills and interests are intentionally NOT modified here.
 * They have their own dedicated CRUD managers:
 *
 * - UserSkillsManager
 * - UserInterestsManager
 *
 * This prevents saving the main profile form from accidentally
 * deleting existing skills or interests.
 */
export async function updateProfile(
  _prevState: UpdateProfileState | null,
  formData: FormData,
): Promise<UpdateProfileState> {
  try {
    const supabase = await createClient();

    // 1. Authenticate
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "You must be logged in to update your profile.",
      };
    }

    // 2. Parse & validate profile fields
    //
    // Empty skills/interests arrays are supplied only because the
    // existing validation schema expects those fields.
    // They are NOT written to the database here.
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
      skills: [],
      interests: [],
    };

    const validation = updateProfileSchema.safeParse(rawData);

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;

      return {
        success: false,
        message: "Please fix the errors in the form.",
        errors: fieldErrors as Partial<
          Record<keyof UpdateProfileInput, string[]>
        >,
      };
    }

    const {
      fullName,
      username,
      bio,
      location,
      availability,
      workMode,
      github,
      linkedin,
      portfolio,
    } = validation.data;

    // 3. Update only the authenticated user's profile row
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
      if (
        updateError.code === "23505" &&
        updateError.message?.includes("username")
      ) {
        return {
          success: false,
          message: "This username is already taken.",
          errors: {
            username: ["This username is already taken."],
          },
        };
      }

      return {
        success: false,
        message: "Failed to update profile. Please try again.",
      };
    }

    // Skills and interests are intentionally NOT modified here.

    // 4. Re-fetch the full profile
    const result = await getCurrentProfile();

    if (!result.success) {
      return {
        success: false,
        message: result.message,
      };
    }

    revalidatePath("/profile");
    revalidatePath("/profile/edit");

    return {
      success: true,
      message: "Profile updated successfully!",
      profile: result.profile,
    };
  } catch {
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}

// ─── uploadAvatarAction ─────────────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Uploads an avatar image for the authenticated user.
 *
 * Ownership is enforced by storing the file under:
 * profiles/{auth.uid()}/avatar
 */
export async function uploadAvatarAction(
  formData: FormData,
): Promise<UploadAvatarResult> {
  try {
    const supabase = await createClient();

    // 1. Authenticate
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "You must be logged in to upload an avatar.",
      };
    }

    // 2. Validate the file
    const file = formData.get("avatar") as File | null;

    if (!file || file.size === 0) {
      return {
        success: false,
        message: "No file selected.",
      };
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        success: false,
        message: "Please upload a JPEG, PNG, WebP, or GIF image.",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        message: "File size must be under 5 MB.",
      };
    }

    // 3. Upload to Supabase Storage
    const fileExt = file.name.split(".").pop() ?? "jpg";
    const filePath = `profiles/${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKETS.AVATARS)
      .upload(filePath, file, {
        upsert: true,
        cacheControl: "3600",
      });

    if (uploadError) {
      return {
        success: false,
        message: "Failed to upload avatar. Please try again.",
      };
    }

    // 4. Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKETS.AVATARS)
      .getPublicUrl(filePath);

    const avatarUrl = publicUrlData.publicUrl;

    // 5. Update the authenticated user's profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      return {
        success: false,
        message: "Avatar uploaded but failed to update profile.",
      };
    }

    revalidatePath("/profile");
    revalidatePath("/profile/edit");

    return {
      success: true,
      avatarUrl,
    };
  } catch {
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}
