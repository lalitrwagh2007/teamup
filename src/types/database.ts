export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type TeamTrack = "technical" | "community"
export type WorkMode = "Remote" | "Hybrid" | "On-site"
export type TeamStatus = "recruiting" | "in_progress" | "completed" | "archived"
export type TeamRoleStatus = "open" | "filled" | "closed"
export type ApplicationStatus = "pending" | "accepted" | "rejected" | "cancelled"
export type InvitationStatus = "pending" | "accepted" | "rejected" | "cancelled"
export type MemberRole = "leader" | "member"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          bio: string | null
          avatar_url: string | null
          location: string | null
          website: string | null
          github: string | null
          linkedin: string | null
          portfolio: string | null
          availability: string | null
          work_mode: WorkMode | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          website?: string | null
          github?: string | null
          linkedin?: string | null
          portfolio?: string | null
          availability?: string | null
          work_mode?: WorkMode | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          website?: string | null
          github?: string | null
          linkedin?: string | null
          portfolio?: string | null
          availability?: string | null
          work_mode?: WorkMode | null
          created_at?: string
          updated_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          name: string
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          created_at?: string
        }
      }
      user_skills: {
        Row: {
          user_id: string
          skill_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          skill_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          skill_id?: string
          created_at?: string
        }
      }
      interests: {
        Row: {
          id: string
          name: string
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          created_at?: string
        }
      }
      user_interests: {
        Row: {
          user_id: string
          interest_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          interest_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          interest_id?: string
          created_at?: string
        }
      }

      teams: {
        Row: {
          id: string
          leader_id: string | null
          name: string
          description: string | null
          track: TeamTrack
          category: string | null
          avatar_url: string | null
          mode: WorkMode | null
          location: string | null
          max_members: number
          status: TeamStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          leader_id?: string | null
          name: string
          description?: string | null
          track: TeamTrack
          category?: string | null
          avatar_url?: string | null
          mode?: WorkMode | null
          location?: string | null
          max_members?: number
          status?: TeamStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          leader_id?: string | null
          name?: string
          description?: string | null
          track?: TeamTrack
          category?: string | null
          avatar_url?: string | null
          mode?: WorkMode | null
          location?: string | null
          max_members?: number
          status?: TeamStatus
          created_at?: string
          updated_at?: string
        }
      }
      team_roles: {
        Row: {
          id: string
          team_id: string
          title: string
          description: string | null
          spots_total: number
          spots_filled: number
          status: TeamRoleStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          title: string
          description?: string | null
          spots_total?: number
          spots_filled?: number
          status?: TeamRoleStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          title?: string
          description?: string | null
          spots_total?: number
          spots_filled?: number
          status?: TeamRoleStatus
          created_at?: string
          updated_at?: string
        }
      }
      team_role_skills: {
        Row: {
          role_id: string
          skill_id: string
          created_at: string
        }
        Insert: {
          role_id: string
          skill_id: string
          created_at?: string
        }
        Update: {
          role_id?: string
          skill_id?: string
          created_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role_id: string | null
          member_role: MemberRole
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role_id?: string | null
          member_role?: MemberRole
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role_id?: string | null
          member_role?: MemberRole
          joined_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          team_id: string
          role_id: string
          applicant_id: string
          message: string | null
          status: ApplicationStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          role_id: string
          applicant_id: string
          message?: string | null
          status?: ApplicationStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          role_id?: string
          applicant_id?: string
          message?: string | null
          status?: ApplicationStatus
          created_at?: string
          updated_at?: string
        }
      }
      invitations: {
        Row: {
          id: string
          team_id: string
          role_id: string | null
          inviter_id: string
          invitee_id: string
          message: string | null
          status: InvitationStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          role_id?: string | null
          inviter_id: string
          invitee_id: string
          message?: string | null
          status?: InvitationStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          role_id?: string | null
          inviter_id?: string
          invitee_id?: string
          message?: string | null
          status?: InvitationStatus
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Json | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: Json | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: Json | null
          read?: boolean
          created_at?: string
        }
      }
    }
  }
}
