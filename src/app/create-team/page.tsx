import { getAvailableRoleSkills } from "@/app/actions/team";

import TeamForm from "@/components/teams/TeamForm";

export default async function CreateTeamPage() {
  const skillsResult = await getAvailableRoleSkills();

  const availableSkills = skillsResult.success ? skillsResult.data : [];

  return <TeamForm availableSkills={availableSkills} />;
}
  