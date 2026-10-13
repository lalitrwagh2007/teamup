import type {
  TeamTrack,
  WorkMode,
  TeamStatus,
  TeamRoleStatus,
  ApplicationStatus,
  InvitationStatus,
  MemberRole,
  ProficiencyLevel,
} from "./database";

export type {
  TeamTrack,
  WorkMode,
  TeamStatus,
  TeamRoleStatus,
  ApplicationStatus,
  InvitationStatus,
  MemberRole,
  ProficiencyLevel,
};

export interface TeamRoleInput {
  id?: string;
  title: string;
  description?: string | null;
  spotsTotal: number;
  skillIds: string[];
}

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
  roles?: TeamRoleInput[];
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
  roles?: TeamRoleInput[];
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

export interface AvailableRoleSkill {
  id: string;
  name: string;
}

export interface CreateTeamRoleInput {
  title: string;
  description?: string | null;
  spotsTotal: number;
  skillIds: string[];
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

export interface TeamRole {
  id: string;
  teamId?: string;
  title: string;
  description?: string;
  requiredSkills?: string[];
  spotsTotal?: number;
  spotsFilled?: number;
  status?: TeamRoleStatus;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  roleId?: string | null;
  memberRole: MemberRole;
  joinedAt?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  track?: TeamTrack;
  category: string;
  avatarUrl?: string;
  skills: string[];
  currentMembers: number;
  maxMembers: number;
  mode: WorkMode;
  location: string;
  status?: TeamStatus;
  roles?: TeamRole[];
  members?: TeamMember[];
}