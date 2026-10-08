// src/types/team.ts

export interface TeamRole {
  id: string;
  title: string;
  description?: string;
  requiredSkills?: string[];
}

export interface Team {
  id: string;
  name: string;
  description: string;
  category: string;
  skills: string[];
  currentMembers: number;
  maxMembers: number;
  mode: "Remote" | "Hybrid" | "On-site";
  location: string;
  roles?: TeamRole[];
}