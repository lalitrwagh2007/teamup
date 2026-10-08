import { z } from "zod";

// ─── URL helper ─────────────────────────────────────────────────────────────

const optionalUrl = z
  .string()
  .trim()
  .url({ message: "Please enter a valid URL." })
  .or(z.literal(""))
  .optional()
  .transform((v) => v || "");

// ─── Profile update schema ──────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(100, { message: "Name must be at most 100 characters." }),

  username: z
    .string()
    .trim()
    .min(3, { message: "Username must be at least 3 characters." })
    .max(40, { message: "Username must be at most 40 characters." })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: "Username can only contain letters, numbers, hyphens, and underscores.",
    })
    .optional()
    .or(z.literal("")),

  bio: z
    .string()
    .trim()
    .max(500, { message: "Bio must be at most 500 characters." })
    .optional()
    .transform((v) => v || ""),

  location: z
    .string()
    .trim()
    .max(100, { message: "Location must be at most 100 characters." })
    .optional()
    .transform((v) => v || ""),

  availability: z
    .string()
    .trim()
    .max(100, { message: "Availability must be at most 100 characters." })
    .optional()
    .transform((v) => v || ""),

  workMode: z
    .enum(["Remote", "Hybrid", "On-site"], {
      message: "Work mode must be Remote, Hybrid, or On-site.",
    })
    .optional()
    .nullable(),

  github: optionalUrl,
  linkedin: optionalUrl,
  portfolio: optionalUrl,

  skills: z
    .array(z.string().trim().min(1))
    .max(20, { message: "You can add up to 20 skills." })
    .optional()
    .default([]),

  interests: z
    .array(z.string().trim().min(1))
    .max(20, { message: "You can add up to 20 interests." })
    .optional()
    .default([]),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
