"use server";

import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@/lib/supabase/server";


interface CloudinaryUploadResult {
  success: boolean;
  url?: string;
  secureUrl?: string;
  publicId?: string;
  error?: string;
  message?: string;
}
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: "Only JPEG, PNG, and WebP images are allowed." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "File size must be under 5 MB." };
  }

  return { valid: true };
}

async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

export async function uploadProfileImage(formData: FormData): Promise<CloudinaryUploadResult> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required." };
    }

    const file = formData.get("avatar") as File | null;

    if (!file) {
      return { success: false, error: "No file provided." };
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Upload to Cloudinary
    const base64File = await fileToBase64(file);

    const uploadResult = await cloudinary.uploader.upload(base64File, {
      folder: "teamup/avatars",
      public_id: `user_${user.id}_${Date.now()}`,
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
      overwrite: true,
      invalidate: true,
    });

    if (!uploadResult.secure_url) {
      return { success: false, error: "Failed to upload image to Cloudinary." };
    }

    // Update profile with new avatar URL
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        avatar_url: uploadResult.secure_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("Failed to update profile avatar:", profileError);
      return { success: false, error: "Failed to save avatar to profile." };
    }

    return {
      success: true,
      secureUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return { success: false, error: "Failed to upload image. Please try again." };
  }
}

export async function deleteProfileImage(): Promise<CloudinaryUploadResult> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required." };
    }

    // Get current avatar URL to extract public_id for deletion
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (profile?.avatar_url) {
      // Extract public_id from Cloudinary URL
      const urlParts = profile.avatar_url.split("/");
      const uploadIndex = urlParts.findIndex((part: string) => part === "upload");
      if (uploadIndex !== -1 && urlParts.length > uploadIndex + 1) {
        // Remove version number if present
        const publicIdParts = urlParts.slice(uploadIndex + 1);
        const publicId = publicIdParts.join("/").replace(/\.[^.]+$/, ""); // Remove extension
        
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (deleteError) {
          console.error("Failed to delete old avatar from Cloudinary:", deleteError);
          // Continue even if deletion fails
        }
      }
    }

    // Clear avatar_url in profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileError) {
      return { success: false, error: "Failed to remove avatar from profile." };
    }

    return { success: true, message: "Avatar removed successfully." };
  } catch (error) {
    console.error("Delete avatar error:", error);
    return { success: false, error: "Failed to remove avatar." };
  }
}