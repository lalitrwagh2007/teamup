"use server";

import { createClient } from "@/lib/supabase/server";
import { addSkillSchema, updateSkillProficiencySchema, removeSkillSchema } from "@/validations/skill.schema";
import type { ProficiencyLevel, Skill, UserSkillItem } from "@/types/user";
import { revalidatePath } from "next/cache";

export type SkillActionResult<T = undefined> =
  | { success: true; message?: string; data: T }  | { success: false; message: string; errors?: Record<string, string[]> };

/**
 * Fetch all available pre-seeded skills from the skills table for user selection/autocomplete.
 */
export async function getAllSkills(): Promise<SkillActionResult<Skill[]>> {
  try {
    const supabase = await createClient();
    const { data: skills, error } = await supabase
      .from("skills")
      .select("id, name, category, created_at")
      .order("name", { ascending: true });

    if (error) {
      return { success: false, message: "Failed to fetch skills from database." };
    }

    return {
      success: true,
      data: (skills ?? []).map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        createdAt: s.created_at,
      })),
    };
  } catch {
    return { success: false, message: "An unexpected error occurred while fetching skills." };
  }
}

/**
 * Fetch user skills with proficiency levels for a specific user (defaults to authenticated user).
 */
export async function getUserSkills(userId?: string): Promise<SkillActionResult<UserSkillItem[]>> {
  try {
    const supabase = await createClient();
    let targetUserId = userId;

    if (!targetUserId) {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, message: "Authentication required." };
      }
      targetUserId = user.id;
    }

    const { data: userSkills, error } = await supabase
      .from("user_skills")
      .select("skill_id, proficiency, skills(id, name, category)")
      .eq("user_id", targetUserId);

    if (error) {
      return { success: false, message: "Failed to fetch user skills." };
    }

    const formattedSkills: UserSkillItem[] = (userSkills ?? []).flatMap((row: Record<string, unknown>) => {
      const s = row.skills as { id: string; name: string; category?: string | null } | null;
      if (!s) return [];

      return [{
        skillId: s.id,
        name: s.name,
        proficiency: (row.proficiency as ProficiencyLevel) || "Intermediate",
        category: s.category ?? null,
      }];
    });

    return { success: true, data: formattedSkills };
  } catch {
    return { success: false, message: "An unexpected error occurred while fetching user skills." };
  }
}

/**
 * Add a skill to the authenticated user's profile.
 * - Ownership enforced via auth.uid().
 * - Reuses existing skill record in `skills` table instead of duplicate records.
 * - Prevents duplicate user_skills mappings (upserts proficiency if mapping exists).
 */
export async function addUserSkill(
  skillNameInput: string,
  proficiencyInput: ProficiencyLevel
): Promise<SkillActionResult<UserSkillItem[]>> {
  try {
    const supabase = await createClient();

    // 1. Authenticate & enforce ownership using auth.uid()
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, message: "You must be logged in to add skills." };
    }

    // 2. Validate inputs server-side
    const validation = addSkillSchema.safeParse({
      skillName: skillNameInput,
      proficiency: proficiencyInput,
    });

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Invalid input. Please provide a valid skill name and proficiency level.",
        errors: fieldErrors as Record<string, string[]>,
      };
    }

    const { skillName, proficiency } = validation.data;

    // 3. Reuse existing skill or create new skill in `skills` table
    const { data: existingSkills } = await supabase
      .from("skills")
      .select("id, name, category")
      .ilike("name", skillName);

    let skillId: string;
    let finalSkillName = skillName;

    if (existingSkills && existingSkills.length > 0) {
      skillId = existingSkills[0].id;
      finalSkillName = existingSkills[0].name;
    } else {
      const { data: newSkill, error: createSkillError } = await supabase
        .from("skills")
        .insert({ name: skillName })
        .select("id, name, category")
        .single();

      if (createSkillError || !newSkill) {
        return { success: false, message: "Failed to create skill record." };
      }
      skillId = newSkill.id;
      finalSkillName = newSkill.name;
    }

    // 4. Prevent duplicate user-skill mapping & store proficiency in Supabase
    // Primary key constraint (user_id, skill_id) prevents duplicates; upsert updates proficiency if present.
    const { error: upsertError } = await supabase
      .from("user_skills")
      .upsert(
        {
          user_id: user.id,
          skill_id: skillId,
          proficiency: proficiency,
        },
        { onConflict: "user_id,skill_id" }
      );

    if (upsertError) {
      return { success: false, message: "Failed to add skill to your profile." };
    }

    revalidatePath("/profile");
    revalidatePath("/profile/edit");

    const updatedUserSkillsResult = await getUserSkills(user.id);
    return {
      success: true,
      message: `Skill "${finalSkillName}" (${proficiency}) added successfully!`,
      data: updatedUserSkillsResult.success ? updatedUserSkillsResult.data : [],
    };
  } catch {
    return { success: false, message: "An unexpected error occurred while adding skill." };
  }
}

/**
 * Remove a skill from the authenticated user's profile.
 * - Ownership enforced via auth.uid().
 */
export async function removeUserSkill(
  skillIdInput: string
): Promise<SkillActionResult<UserSkillItem[]>> {
  try {
    const supabase = await createClient();

    // 1. Authenticate & enforce ownership using auth.uid()
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, message: "You must be logged in to remove skills." };
    }

    // 2. Validate input
    const validation = removeSkillSchema.safeParse({ skillId: skillIdInput });
    if (!validation.success) {
      return { success: false, message: "Invalid skill ID provided." };
    }

    const { skillId } = validation.data;

    // 3. Delete from user_skills scoped strictly to auth.uid()
    const { error: deleteError } = await supabase
      .from("user_skills")
      .delete()
      .eq("user_id", user.id)
      .eq("skill_id", skillId);

    if (deleteError) {
      return { success: false, message: "Failed to remove skill from your profile." };
    }

    revalidatePath("/profile");
    revalidatePath("/profile/edit");

    const updatedUserSkillsResult = await getUserSkills(user.id);
    return {
      success: true,
      message: "Skill removed successfully.",
data: updatedUserSkillsResult.success ? updatedUserSkillsResult.data : [],    };
  } catch {
    return { success: false, message: "An unexpected error occurred while removing skill." };
  }
}

/**
 * Update proficiency level of an existing user skill.
 * - Ownership enforced via auth.uid().
 * - Proficiency must be exact enum: Beginner | Intermediate | Advanced | Expert.
 */
export async function updateSkillProficiency(
  skillIdInput: string,
  newProficiencyInput: ProficiencyLevel
): Promise<SkillActionResult<UserSkillItem[]>> {
  try {
    const supabase = await createClient();

    // 1. Authenticate & enforce ownership using auth.uid()
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, message: "You must be logged in to update skill proficiency." };
    }

    // 2. Validate input server-side
    const validation = updateSkillProficiencySchema.safeParse({
      skillId: skillIdInput,
      proficiency: newProficiencyInput,
    });

    if (!validation.success) {
      return { success: false, message: "Invalid skill ID or proficiency level." };
    }

    const { skillId, proficiency } = validation.data;

    // 3. Update user_skills scoped strictly to auth.uid()
    const { error: updateError } = await supabase
      .from("user_skills")
      .update({ proficiency })
      .eq("user_id", user.id)
      .eq("skill_id", skillId);

    if (updateError) {
      return { success: false, message: "Failed to update skill proficiency." };
    }

    revalidatePath("/profile");
    revalidatePath("/profile/edit");

    const updatedUserSkillsResult = await getUserSkills(user.id);
    return {
      success: true,
      message: `Proficiency level updated to ${proficiency}.`,
      data: updatedUserSkillsResult.success ? updatedUserSkillsResult.data : [],
    };
  } catch {
    return { success: false, message: "An unexpected error occurred while updating proficiency." };
  }
}


