import { ApplicationStatus, InvitationStatus, MemberRole, TeamRoleStatus, TeamStatus, TeamTrack, WorkMode } from "./database";

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  bio: string;
  location: string;
  avatarUrl: string;
  skills: string[];
  interests: string[];
  availability: string;
  workMode: WorkMode;
  github: string;
  linkedin: string;
  portfolio: string;
  profileCompletion: number;
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
