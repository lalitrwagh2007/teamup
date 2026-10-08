import { ApplicationStatus, InvitationStatus, Json } from "./database";

export interface Application {
  id: string;
  teamId: string;
  roleId: string;
  applicantId: string;
  message?: string | null;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  id: string;
  teamId: string;
  roleId?: string | null;
  inviterId: string;
  inviteeId: string;
  message?: string | null;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Json | null;
  read: boolean;
  createdAt: string;
}
