import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import SkillTags, { SkillTagItem } from "./SkillTags";
import ProfileCompletion from "./ProfileCompletion";

export type AvailabilityStatus = "Available" | "Busy" | "Looking for team";

export interface ProfileData {
  name: string;
  avatarUrl?: string;
  bio: string;
  location: string;
  skills: SkillTagItem[];
  availability: AvailabilityStatus;
  completionPercentage: number;
}

interface ProfileCardProps {
  profile: ProfileData;
  className?: string;
}

export default function ProfileCard({ profile, className }: ProfileCardProps) {
  const {
    name,
    avatarUrl,
    bio,
    location,
    skills,
    availability,
    completionPercentage,
  } = profile;

  // Choose a badge variant based on the user's availability
  const availabilityVariant =
    availability === "Available"
      ? "default"
      : availability === "Looking for team"
      ? "secondary"
      : "outline";

  return (
    <Card className={cn("w-full overflow-hidden", className)}>
      <CardHeader className="flex flex-col items-start gap-4 pb-4 sm:flex-row sm:items-center">
        <Avatar className="size-16 shrink-0">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback className="bg-indigo-100 text-xl font-semibold text-indigo-700">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="truncate text-xl font-bold">{name}</h2>
            <Badge variant={availabilityVariant} className="shrink-0">
              {availability}
            </Badge>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-1 size-3.5 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 pt-0">
        {/* Bio Section */}
        <div>
          <h3 className="mb-1 text-sm font-semibold">About</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {bio}
          </p>
        </div>

        {/* Skills Section */}
        <div>
          <h3 className="mb-2 text-sm font-semibold">Skills</h3>
          <SkillTags skills={skills} />
        </div>

        {/* Completion Section */}
        <div className="pt-2">
          {/* We reuse the simplified ProfileCompletion we built earlier */}
          <ProfileCompletion percentage={completionPercentage} />
        </div>
      </CardContent>
    </Card>
  );
}
