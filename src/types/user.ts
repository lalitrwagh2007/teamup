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
  workMode: "Remote" | "Hybrid" | "On-site";
  github: string;
  linkedin: string;
  portfolio: string;
  profileCompletion: number;
}