import { SupabaseClient } from "@supabase/supabase-js";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

export const BUCKETS = {
  AVATARS: "avatars",
  TEAM_DOCUMENTS: "team_documents",
} as const;

export interface UploadOptions {
  upsert?: boolean;
}

/**
 * Uploads a user or team avatar image to the public 'avatars' bucket.
 * Files are organized by path: `profiles/{userId}/{filename}` or `teams/{teamId}/{filename}`.
 */
export async function uploadAvatar(
  supabase: SupabaseClient,
  filePath: string,
  file: File | Blob,
  options: UploadOptions = { upsert: true }
) {
  const { data, error } = await supabase.storage
    .from(BUCKETS.AVATARS)
    .upload(filePath, file, {
      upsert: options.upsert,
      cacheControl: "3600",
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKETS.AVATARS)
    .getPublicUrl(data.path);

  return {
    path: data.path,
    publicUrl: publicUrlData.publicUrl,
  };
}

/**
 * Retrieves the public URL for an avatar given its storage path.
 */
export function getAvatarPublicUrl(supabase: SupabaseClient, filePath: string): string {
  const { data } = supabase.storage
    .from(BUCKETS.AVATARS)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Uploads a document file to the private 'team_documents' bucket.
 * Path pattern: `{teamId}/{filename}`
 */
export async function uploadTeamDocument(
  supabase: SupabaseClient,
  teamId: string,
  file: File | Blob,
  fileName: string,
  options: UploadOptions = { upsert: true }
) {
  const filePath = `${teamId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKETS.TEAM_DOCUMENTS)
    .upload(filePath, file, {
      upsert: options.upsert,
    });

  if (error) {
    throw error;
  }

  return {
    path: data.path,
  };
}

/**
 * Generates a temporary signed URL to download or view a private team document.
 * Default expiration is 1 hour (3600 seconds).
 */
export async function getTeamDocumentSignedUrl(
  supabase: SupabaseClient,
  filePath: string,
  expiresInSeconds: number = 3600
) {
  const { data, error } = await supabase.storage
    .from(BUCKETS.TEAM_DOCUMENTS)
    .createSignedUrl(filePath, expiresInSeconds);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

/**
 * Deletes a file from specified storage bucket.
 */
export async function deleteStorageFile(
  supabase: SupabaseClient,
  bucket: typeof BUCKETS[keyof typeof BUCKETS],
  filePath: string
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    throw error;
  }

  return data;
}
