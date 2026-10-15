import { getAvailableRoleSkills } from "@/app/actions/team";
import { getAllInterests } from "@/app/actions/interests";

import TeamForm from "@/components/teams/TeamForm";

export default async function CreateTeamPage() {
  const [skillsResult, interestsResult] = await Promise.all([
    getAvailableRoleSkills(),
    getAllInterests(),
  ]);

  const availableSkills = skillsResult.success ? skillsResult.data : [];
  const availableInterests = interestsResult.success ? interestsResult.data : [];

  return (
    <TeamForm
      availableSkills={availableSkills}
      availableInterests={availableInterests}
    />
  );
}
  