"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Interest } from "@/types/user";
import {
  addInterestSchema,
  removeInterestSchema,
} from "@/validations/interest.schema";

export type InterestActionResult<T = undefined> =
  | {
      success: true;
      message?: string;
      data: T;
    }
  | {
      success: false;
      message: string;
      errors?: Record<string, string[]>;
    };

type InterestRow = {
  id: string;
  name: string;
  category: string | null;
  created_at: string;
};

function mapInterest(row: InterestRow): Interest {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    createdAt: row.created_at,
  };
}

async function getAuthenticatedClient() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      supabase,
      user: null,
    };
  }

  return {
    supabase,
    user,
  };
}

/**
 * Fetch all interests belonging to the authenticated user.
 */
export async function getUserInterests(): Promise<
  InterestActionResult<Interest[]>
> {
  try {
    const { supabase, user } = await getAuthenticatedClient();

    if (!user) {
      return {
        success: false,
        message: "Authentication required.",
      };
    }

    const { data: mappings, error: mappingError } = await supabase
      .from("user_interests")
      .select("interest_id")
      .eq("user_id", user.id);

    if (mappingError) {
      return {
        success: false,
        message: "Failed to fetch your interests.",
      };
    }

    const interestIds = (mappings ?? []).map((mapping) => mapping.interest_id);

    if (interestIds.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    const { data: interests, error: interestsError } = await supabase
      .from("interests")
      .select("id, name, category, created_at")
      .in("id", interestIds);

    if (interestsError) {
      return {
        success: false,
        message: "Failed to fetch your interest details.",
      };
    }

    const formattedInterests = (interests ?? [])
      .map((interest) => mapInterest(interest))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      success: true,
      data: formattedInterests,
    };
  } catch {
    return {
      success: false,
      message: "An unexpected error occurred while fetching interests.",
    };
  }
}

/**
 * Add an interest to the authenticated user's profile.
 *
 * Existing interest records are reused instead of creating duplicates.
 */
export async function addUserInterest(
  interestNameInput: string,
): Promise<InterestActionResult<Interest[]>> {
  try {
    const { supabase, user } = await getAuthenticatedClient();

    if (!user) {
      return {
        success: false,
        message: "You must be logged in to add interests.",
      };
    }

    const validation = addInterestSchema.safeParse({
      interestName: interestNameInput,
    });

    if (!validation.success) {
      return {
        success: false,
        message: "Invalid interest name.",
        errors: validation.error.flatten().fieldErrors as Record<
          string,
          string[]
        >,
      };
    }

    const { interestName } = validation.data;

    // Reuse an existing interest record, case-insensitively.
    const { data: existingInterests, error: lookupError } = await supabase
      .from("interests")
      .select("id, name, category, created_at")
      .ilike("name", interestName);

    if (lookupError) {
      return {
        success: false,
        message: "Failed to look up the interest.",
      };
    }

    let interest: InterestRow;

    if (existingInterests && existingInterests.length > 0) {
      interest = existingInterests[0];
    } else {
      const { data: newInterest, error: createError } = await supabase
        .from("interests")
        .insert({
          name: interestName,
        })
        .select("id, name, category, created_at")
        .single();

      if (createError || !newInterest) {
        return {
          success: false,
          message: "Failed to create the interest.",
        };
      }

      interest = newInterest;
    }

    // Check whether this authenticated user already has the interest.
    const { data: existingMapping, error: mappingLookupError } = await supabase
      .from("user_interests")
      .select("user_id, interest_id")
      .eq("user_id", user.id)
      .eq("interest_id", interest.id)
      .maybeSingle();

    if (mappingLookupError) {
      return {
        success: false,
        message: "Failed to check whether the interest is already added.",
      };
    }

    if (existingMapping) {
      return {
        success: false,
        message: `"${interest.name}" is already in your interests.`,
      };
    }

    // The database primary key (user_id, interest_id) also prevents duplicates.
    const { error: insertError } = await supabase
      .from("user_interests")
      .insert({
        user_id: user.id,
        interest_id: interest.id,
      });

    if (insertError) {
      if (insertError.code === "23505") {
        return {
          success: false,
          message: `"${interest.name}" is already in your interests.`,
        };
      }

      return {
        success: false,
        message: "Failed to add the interest to your profile.",
      };
    }

    revalidatePath("/profile");
    revalidatePath("/profile/edit");

    const updatedInterests = await getUserInterests();

    return {
      success: true,
      message: `"${interest.name}" added successfully.`,
      data: updatedInterests.success
        ? updatedInterests.data
        : [mapInterest(interest)],
    };
  } catch {
    return {
      success: false,
      message: "An unexpected error occurred while adding the interest.",
    };
  }
}

/**
 * Remove an interest from the authenticated user's profile.
 */
export async function removeUserInterest(
  interestIdInput: string,
): Promise<InterestActionResult<Interest[]>> {
  try {
    const { supabase, user } = await getAuthenticatedClient();

    if (!user) {
      return {
        success: false,
        message: "You must be logged in to remove interests.",
      };
    }

    const validation = removeInterestSchema.safeParse({
      interestId: interestIdInput,
    });

    if (!validation.success) {
      return {
        success: false,
        message: "Invalid interest ID provided.",
      };
    }

    const { interestId } = validation.data;

    const { error: deleteError } = await supabase
      .from("user_interests")
      .delete()
      .eq("user_id", user.id)
      .eq("interest_id", interestId);

    if (deleteError) {
      return {
        success: false,
        message: "Failed to remove the interest from your profile.",
      };
    }

    revalidatePath("/profile");
    revalidatePath("/profile/edit");

    const updatedInterests = await getUserInterests();

    return {
      success: true,
      message: "Interest removed successfully.",
      data: updatedInterests.success ? updatedInterests.data : [],
    };
  } catch {
    return {
      success: false,
      message: "An unexpected error occurred while removing the interest.",
    };
  }
}
