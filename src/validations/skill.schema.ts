import { z } from "zod";

export const proficiencyEnum = z.enum(["Beginner", "Intermediate", "Advanced", "Expert"], {
  message: "Proficiency must be one of: Beginner, Intermediate, Advanced, Expert.",
});

export const addSkillSchema = z.object({
  skillName: z
    .string()
    .trim()
    .min(1, { message: "Skill name is required." })
    .max(50, { message: "Skill name must be at most 50 characters." }),
  proficiency: proficiencyEnum,
});

export const updateSkillProficiencySchema = z.object({
  skillId: z.string().min(1, { message: "Skill ID is required." }),
  proficiency: proficiencyEnum,
});

export const removeSkillSchema = z.object({
  skillId: z.string().min(1, { message: "Skill ID is required." }),
});

export type AddSkillInput = z.infer<typeof addSkillSchema>;
export type UpdateSkillProficiencyInput = z.infer<typeof updateSkillProficiencySchema>;
export type RemoveSkillInput = z.infer<typeof removeSkillSchema>;

