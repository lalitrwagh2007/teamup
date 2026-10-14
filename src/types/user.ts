import { ProficiencyLevel, WorkMode, TeamPreference } from "./database";

export type { ProficiencyLevel, TeamPreference };

export interface UserSkillItem {
  skillId: string;
  name: string;
  proficiency: ProficiencyLevel;
  category?: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  bio: string;
  location: string;
  avatarUrl: string;
  skills: (string | UserSkillItem)[];
  userSkills?: UserSkillItem[];
  interests: string[];
  availability: string;
  workMode: WorkMode;
  github: string;
  linkedin: string;
  portfolio: string;
  profileCompletion: number;
  phoneNumber: string | null;
  phoneVerified: boolean | null;
  sharePhoneWithTeam: boolean | null;
  teamStatus: TeamPreference | null;
}

export interface Skill {
  id: string;
  name: string;
  category?: string | null;
  createdAt?: string;
}

export interface Interest {
  id: string;
  name: string;
  category?: string | null;
  createdAt?: string;
}

