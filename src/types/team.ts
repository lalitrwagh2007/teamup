import { MemberRole, TeamRoleStatus, TeamStatus, TeamTrack, WorkMode } from "./database";

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
