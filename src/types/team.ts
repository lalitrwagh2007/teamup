export interface TeamOwner {
  id: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface TeamMemberDetail {
  id: string;
  userId: string;
  memberRole: string;
  joinedAt: string | null;
  profile: TeamOwner | null;
}

export interface TeamRoleSkill {
  id: string;
  name: string;
}

export interface TeamRoleDetail {
  id: string;
  title: string;
  description: string | null;
  spotsTotal: number;
  spotsFilled: number;
  status: string;
  requiredSkills: TeamRoleSkill[];
}

export interface TeamDetails extends TeamRecord {
  owner: TeamOwner | null;
  members: TeamMemberDetail[];
  roles: TeamRoleDetail[];
  currentMembers: number;
}
export type TeamTrack = "technical" | "community";

export type TeamStatus =
  | "recruiting"
  | "in_progress"
  | "completed"
  | "archived";

export type WorkMode = "Remote" | "Hybrid" | "On-site";

export interface TeamRecord {
  id: string;
  leaderId: string | null;
  name: string;
  description: string | null;
  track: TeamTrack;
  category: string | null;
  avatarUrl: string | null;
  mode: WorkMode | null;
  location: string | null;
  maxMembers: number;
  status: TeamStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamInput {
  name: string;
  description?: string | null;
  track: TeamTrack;
  category?: string | null;
  avatarUrl?: string | null;
  mode?: WorkMode | null;
  location?: string | null;
  maxMembers?: number;
}

export interface UpdateTeamInput {
  name?: string;
  description?: string | null;
  track?: TeamTrack;
  category?: string | null;
  avatarUrl?: string | null;
  mode?: WorkMode | null;
  location?: string | null;
  maxMembers?: number;
  status?: TeamStatus;
}

export type TeamActionResult<T> =
  | {
      success: true;
      data: T;
      error: null;
    }
  | {
      success: false;
      data: null;
      error: string;
    };

export interface TeamOwner {
  id: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface TeamMemberDetail {
  id: string;
  userId: string;
  memberRole: string;
  joinedAt: string | null;
  profile: TeamOwner | null;
}

export interface TeamRoleSkill {
  id: string;
  name: string;
}

export interface TeamRoleDetail {
  id: string;
  title: string;
  description: string | null;
  spotsTotal: number;
  spotsFilled: number;
  status: string;
  requiredSkills: TeamRoleSkill[];
}

export interface TeamDetails extends TeamRecord {
  owner: TeamOwner | null;
  members: TeamMemberDetail[];
  roles: TeamRoleDetail[];
  currentMembers: number;
}