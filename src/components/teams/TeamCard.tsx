import Link from "next/link";
import { Star, Users } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export interface TeamCardData {
  id: string;
  name: string;
  tagline: string;
  category: string;
  categoryColor: string; // tailwind bg + text classes
  skills: string[];
  members: { name: string; avatar?: string }[];
  spotsLeft: number;
  totalSpots: number;
  rating: number;
}

interface TeamCardProps {
  team: TeamCardData;
}

export default function TeamCard({ team }: TeamCardProps) {
  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold">{team.name}</CardTitle>
          <span
            className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ring-current/20 ${team.categoryColor}`}
          >
            {team.category}
          </span>
        </div>
        <CardDescription className="line-clamp-2 text-sm">
          {team.tagline}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        {/* Skills */}
        <div className="flex flex-wrap gap-1.5">
          {team.skills.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>

        {/* Members + spots */}
        <div className="flex items-center justify-between">
          <AvatarGroup>
            {team.members.map((m) => (
              <Avatar key={m.name} size="sm">
                <AvatarImage src={m.avatar ?? ""} alt={m.name} />
                <AvatarFallback>{m.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="size-3.5" />
            {team.spotsLeft}/{team.totalSpots} spots left
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          {team.rating}
        </div>
        <Button size="sm" variant="outline" className="rounded-lg">
          <Link href={`/teams/${team.id}`}>View team</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
