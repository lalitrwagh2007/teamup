import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import SkillTags from "@/components/profile/SkillTags";
import TeamCapacity from "@/components/teams/TeamCapacity";

export interface TeamCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  currentMembers: number;
  maxMembers: number;
  skills: string[];
  mode: string;
  location?: string;
}

export default function TeamCard({
  id,
  name,
  description,
  category,
  currentMembers,
  maxMembers,
  skills,
  mode,
  location,
}: TeamCardProps) {
  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <CardTitle className="text-lg font-semibold">{name}</CardTitle>

          <span className="w-fit rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
            {category}
          </span>
        </div>

        <CardDescription className="line-clamp-3">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-5">
        <div>
          <p className="mb-2 text-sm font-medium">Skills</p>

          <SkillTags skills={skills} />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Team Capacity</p>

          <TeamCapacity
            currentMembers={currentMembers}
            maxMembers={maxMembers}
          />
        </div>

        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Work mode</p>

            <p className="font-medium">{mode}</p>
          </div>

          {location && (
            <div>
              <p className="text-muted-foreground">Location</p>

              <p className="font-medium">{location}</p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href={`/teams/${id}`}>View Team</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
