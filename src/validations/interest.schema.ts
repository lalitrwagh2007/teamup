import { z } from "zod";

export const addInterestSchema = z.object({
  interestName: z
    .string()
    .trim()
    .min(1, { message: "Interest name is required." })
    .max(50, { message: "Interest name must be at most 50 characters." }),
});

export const removeInterestSchema = z.object({
  interestId: z.string().uuid({ message: "A valid interest ID is required." }),
});

export type AddInterestInput = z.infer<typeof addInterestSchema>;
export type RemoveInterestInput = z.infer<typeof removeInterestSchema>;
