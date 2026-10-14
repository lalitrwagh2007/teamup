"use server";

import { createClient } from "@/lib/supabase/server";

export interface PhoneOTPResult {
  success: boolean;
  message?: string;
  error?: string;
}

function normalizePhoneNumber(phoneNumber: string): string {
  return phoneNumber.trim().replace(/[\s()-]/g, "");
}

function isValidE164(phoneNumber: string): boolean {
  return /^\+[1-9]\d{1,14}$/.test(phoneNumber);
}

/**
 * Send OTP for adding/changing the authenticated user's
 * verified contact phone number.
 */
export async function sendPhoneOTP(
  phoneNumber: string,
): Promise<PhoneOTPResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required.",
      };
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    if (!isValidE164(normalizedPhone)) {
      return {
        success: false,
        error:
          "Please enter a valid phone number in international format (e.g., +919876543210).",
      };
    }

    // Starts Supabase phone-change verification for the
    // currently authenticated user.
    const { error: phoneError } = await supabase.auth.updateUser({
      phone: normalizedPhone,
    });

    if (phoneError) {
      console.error("Supabase phone update error:", phoneError);

      return {
        success: false,
        error: "Failed to send verification code. Please try again.",
      };
    }

    // Store the new number as unverified until OTP verification succeeds.
    const { error: contactError } = await supabase
      .from("profile_contacts")
      .upsert(
        {
          user_id: user.id,
          phone_number: normalizedPhone,
          phone_verified: false,
          share_phone_with_team: false,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      );

    if (contactError) {
      console.error("Failed to reset phone verification state:", contactError);

      return {
        success: false,
        error:
          "Verification code was sent, but contact status could not be updated.",
      };
    }

    return {
      success: true,
      message: "Verification code sent successfully.",
    };
  } catch (error) {
    console.error("Send phone OTP error:", error);

    return {
      success: false,
      error: "An unexpected error occurred while sending the code.",
    };
  }
}

/**
 * Verify the OTP sent for the authenticated user's phone change.
 */
export async function verifyPhoneOTP(
  phoneNumber: string,
  otp: string,
): Promise<PhoneOTPResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required.",
      };
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const normalizedOtp = otp.trim();

    if (!isValidE164(normalizedPhone)) {
      return {
        success: false,
        error: "Invalid phone number format.",
      };
    }

    if (!/^\d{6}$/.test(normalizedOtp)) {
      return {
        success: false,
        error: "Please enter a valid 6-digit code.",
      };
    }

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      phone: normalizedPhone,
      token: normalizedOtp,
      type: "phone_change",
    });

    if (verifyError) {
      console.error("Supabase verify phone change OTP error:", verifyError);

      return {
        success: false,
        error: "Invalid or expired verification code. Please try again.",
      };
    }

    if (!data.user || data.user.id !== user.id) {
      return {
        success: false,
        error: "Unable to confirm verified user.",
      };
    }

    const verifiedPhone = data.user.phone;

    if (!verifiedPhone || verifiedPhone !== normalizedPhone) {
      return {
        success: false,
        error: "Phone verification could not be confirmed.",
      };
    }

    const { error: contactError } = await supabase
      .from("profile_contacts")
      .upsert(
        {
          user_id: user.id,
          phone_number: verifiedPhone,
          phone_verified: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      );

    if (contactError) {
      console.error(
        "Failed to update verified contact information:",
        contactError,
      );

      return {
        success: false,
        error:
          "Phone was verified, but the contact information could not be updated.",
      };
    }

    return {
      success: true,
      message: "Phone number verified successfully!",
    };
  } catch (error) {
    console.error("Verify phone OTP error:", error);

    return {
      success: false,
      error: "An unexpected error occurred while verifying the code.",
    };
  }
}

/**
 * Get the authenticated user's phone verification status.
 */
export async function getPhoneVerificationStatus(): Promise<
  PhoneOTPResult & {
    phoneVerified?: boolean;
    phoneNumber?: string | null;
  }
> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required.",
      };
    }

    const { data: contact, error } = await supabase
      .from("profile_contacts")
      .select("phone_number, phone_verified")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch phone verification status:", error);

      return {
        success: false,
        error: "Failed to fetch phone verification status.",
      };
    }

    return {
      success: true,
      phoneVerified: contact?.phone_verified ?? false,
      phoneNumber: contact?.phone_number ?? null,
    };
  } catch (error) {
    console.error("Phone verification status error:", error);

    return {
      success: false,
      error: "An unexpected error occurred.",
    };
  }
}

/**
 * Remove the user's TeamUp contact number.
 */
export async function removeVerifiedPhone(): Promise<PhoneOTPResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required.",
      };
    }

    const { error } = await supabase
      .from("profile_contacts")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to remove verified phone:", error);

      return {
        success: false,
        error: "Failed to remove phone number.",
      };
    }

    return {
      success: true,
      message: "Phone number removed successfully.",
    };
  } catch (error) {
    console.error("Remove phone error:", error);

    return {
      success: false,
      error: "An unexpected error occurred.",
    };
  }
}

/**
 * Allow or prevent verified phone sharing with actual TeamUp teammates.
 */
export async function updatePhoneSharePreference(
  share: boolean,
): Promise<PhoneOTPResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required.",
      };
    }

    const { data: contact, error: contactFetchError } = await supabase
      .from("profile_contacts")
      .select("phone_verified")
      .eq("user_id", user.id)
      .maybeSingle();

    if (contactFetchError) {
      console.error(
        "Failed to fetch contact sharing state:",
        contactFetchError,
      );

      return {
        success: false,
        error: "Failed to update sharing preference.",
      };
    }

    if (!contact) {
      return {
        success: false,
        error: "Add and verify a phone number first.",
      };
    }

    if (share && !contact.phone_verified) {
      return {
        success: false,
        error: "Verify your phone number before sharing it.",
      };
    }

    const { error } = await supabase
      .from("profile_contacts")
      .update({
        share_phone_with_team: share,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to update phone share preference:", error);

      return {
        success: false,
        error: "Failed to update sharing preference.",
      };
    }

    return {
      success: true,
      message: share
        ? "Phone number will be shared with authorized team members."
        : "Phone number will not be shared.",
    };
  } catch (error) {
    console.error("Update phone sharing error:", error);

    return {
      success: false,
      error: "An unexpected error occurred.",
    };
  }
}

/**
 * Update the user's team-finding preference.
 *
 * This does NOT create/remove actual team membership.
 * Actual membership continues to use team_members and teams.leader_id.
 */
export async function updateTeamStatus(
  status: "finding_team" | "already_have_team",
): Promise<PhoneOTPResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required.",
      };
    }

    if (status !== "finding_team" && status !== "already_have_team") {
      return {
        success: false,
        error: "Invalid team status.",
      };
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        team_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Failed to update team status:", error);

      return {
        success: false,
        error: "Failed to update team status.",
      };
    }

    return {
      success: true,
      message:
        status === "finding_team"
          ? "Team status updated to Looking for a Team."
          : "Team status updated to Already Have a Team.",
    };
  } catch (error) {
    console.error("Update team status error:", error);

    return {
      success: false,
      error: "An unexpected error occurred.",
    };
  }
}
