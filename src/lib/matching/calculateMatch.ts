import type { ProficiencyLevel } from "@/types/database";

export const MATCH_WEIGHTS = {
  skills: 40,
  availability: 20,
  ratings: 20,
  interests: 10,
  reliability: 10,
} as const;

export interface MatchSkill {
  id?: string;
  name: string;
  proficiency?: ProficiencyLevel | null;
}

export interface RequiredSkill {
  id?: string;
  name: string;
}

export interface MatchRole {
  id?: string;
  title?: string;
  requiredSkills?: RequiredSkill[];
}

export interface AvailabilityHours {
  start: number;
  end: number;
}

export interface MatchInput {
  user: {
    skills?: MatchSkill[] | null;
    availabilityHours?: AvailabilityHours | null;
    interests?: string[] | null;
    rating?: number | null;
    responseReliability?: number | null;
    availabilityStatus?: string | null;
  };

  team: {
    roles?: MatchRole[] | null;
    requiredSkills?: RequiredSkill[] | null;
    availabilityHours?: AvailabilityHours | null;
    interests?: string[] | null;
  };
}

export interface MatchBreakdown {
  skills: number;
  availability: number;
  ratings: number;
  interests: number;
  reliability: number;
}

export interface MatchResult {
  overallScore: number;
  breakdown: MatchBreakdown;
}

const PROFICIENCY_SCORES: Record<ProficiencyLevel, number> = {
  Beginner: 0.25,
  Intermediate: 0.5,
  Advanced: 0.75,
  Expert: 1,
};

function clamp(value: number, min = 0, max = 1): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
}

function normalizePercentage(value: number): number {
  return Math.round(clamp(value, 0, 100));
}

function normalizeName(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function skillMatches(
  userSkill: MatchSkill,
  requiredSkill: RequiredSkill,
): boolean {
  if (userSkill.id && requiredSkill.id) {
    return userSkill.id === requiredSkill.id;
  }

  return (
    normalizeName(userSkill.name) !== "" &&
    normalizeName(userSkill.name) === normalizeName(requiredSkill.name)
  );
}

function getProficiencyScore(
  proficiency: ProficiencyLevel | null | undefined,
): number {
  if (!proficiency) {
    return PROFICIENCY_SCORES.Intermediate;
  }

  return PROFICIENCY_SCORES[proficiency] ?? PROFICIENCY_SCORES.Intermediate;
}

/**
 * Calculates skill compatibility from 0-100.
 *
 * Each required skill contributes equally.
 * A matched skill receives a score based on the user's proficiency:
 *
 * Beginner     = 25%
 * Intermediate = 50%
 * Advanced     = 75%
 * Expert       = 100%
 *
 * If the team has no required skills, compatibility is 100%.
 * If the team has required skills and the user has none, compatibility is 0%.
 *
 * When several roles exist, the user's best role match is used because
 * a candidate only needs to be suitable for one open role.
 */
export function calculateSkillCompatibility(
  userSkills: MatchSkill[] | null | undefined,
  roles: MatchRole[] | null | undefined,
  teamRequiredSkills: RequiredSkill[] | null | undefined,
): number {
  const safeUserSkills = userSkills ?? [];

  const roleRequirements = (roles ?? [])
    .map((role) => role.requiredSkills ?? [])
    .filter((skills) => skills.length > 0);

  const requirementSets =
    roleRequirements.length > 0
      ? roleRequirements
      : (teamRequiredSkills ?? []).length > 0
        ? [teamRequiredSkills ?? []]
        : [];

  if (requirementSets.length === 0) {
    return 100;
  }

  if (safeUserSkills.length === 0) {
    return 0;
  }

  const roleScores = requirementSets.map((requiredSkills) => {
    const total = requiredSkills.reduce((score, requiredSkill) => {
      const matchingUserSkill = safeUserSkills.find((userSkill) =>
        skillMatches(userSkill, requiredSkill),
      );

      if (!matchingUserSkill) {
        return score;
      }

      return score + getProficiencyScore(matchingUserSkill.proficiency);
    }, 0);

    return requiredSkills.length > 0 ? clamp(total / requiredSkills.length) : 1;
  });

  return normalizePercentage(Math.max(...roleScores) * 100);
}

/**
 * Calculates availability overlap from 0-100.
 *
 * Availability is represented as a numeric [start, end] hour window
 * when that data exists.
 *
 * Formula:
 * intersection hours / union hours * 100
 *
 * If no availability-hour data exists in the current schema, the function
 * returns a neutral deterministic score of 50 rather than inventing hours.
 */
export function calculateAvailabilityCompatibility(
  userAvailability: AvailabilityHours | null | undefined,
  teamAvailability: AvailabilityHours | null | undefined,
): number {
  if (!userAvailability || !teamAvailability) {
    return 50;
  }

  const userStart = Number(userAvailability.start);
  const userEnd = Number(userAvailability.end);
  const teamStart = Number(teamAvailability.start);
  const teamEnd = Number(teamAvailability.end);

  if (
    !Number.isFinite(userStart) ||
    !Number.isFinite(userEnd) ||
    !Number.isFinite(teamStart) ||
    !Number.isFinite(teamEnd)
  ) {
    return 50;
  }

  if (
    userEnd <= userStart ||
    teamEnd <= teamStart ||
    userStart < 0 ||
    teamStart < 0 ||
    userEnd > 24 ||
    teamEnd > 24
  ) {
    return 50;
  }

  const intersectionStart = Math.max(userStart, teamStart);
  const intersectionEnd = Math.min(userEnd, teamEnd);

  const intersection = Math.max(0, intersectionEnd - intersectionStart);
  const userHours = userEnd - userStart;
  const teamHours = teamEnd - teamStart;
  const union = Math.max(userEnd, teamEnd) - Math.min(userStart, teamStart);

  if (userHours <= 0 || teamHours <= 0 || union <= 0) {
    return 50;
  }

  return normalizePercentage((intersection / union) * 100);
}

/**
 * Normalizes a 1-5 rating into a 0-100 score.
 *
 * Users without a persisted rating receive exactly 4.5 / 5.
 */
export function calculateRatingScore(
  rating: number | null | undefined,
): number {
  const effectiveRating = Number.isFinite(rating) ? Number(rating) : 4.5;

  const normalizedRating = clamp(effectiveRating / 5);

  return normalizePercentage(normalizedRating * 100);
}

/**
 * Calculates interest compatibility from 0-100.
 *
 * Formula:
 * matching team interests / total team interests * 100
 *
 * If the team has no persisted interest information, a neutral 50%
 * score is returned because the current database does not define a
 * team-interest relationship.
 */
export function calculateInterestCompatibility(
  userInterests: string[] | null | undefined,
  teamInterests: string[] | null | undefined,
): number {
  const safeTeamInterests = (teamInterests ?? [])
    .map(normalizeName)
    .filter(Boolean);

  if (safeTeamInterests.length === 0) {
    return 50;
  }

  const safeUserInterests = new Set(
    (userInterests ?? []).map(normalizeName).filter(Boolean),
  );

  if (safeUserInterests.size === 0) {
    return 0;
  }

  const matches = safeTeamInterests.filter((interest) =>
    safeUserInterests.has(interest),
  ).length;

  return normalizePercentage((matches / safeTeamInterests.length) * 100);
}

/**
 * Normalizes response reliability from 0-1 into 0-100.
 *
 * If the repository does not yet persist response reliability,
 * a neutral deterministic score of 50 is used.
 */
export function calculateReliabilityScore(
  reliability: number | null | undefined,
): number {
  if (reliability === null || reliability === undefined) {
    return 50;
  }

  if (!Number.isFinite(reliability)) {
    return 50;
  }

  return normalizePercentage(clamp(reliability) * 100);
}

/**
 * Calculates the complete TeamUp match score.
 *
 * Exact weights:
 * Skills       = 40%
 * Availability = 20%
 * Ratings      = 20%
 * Interests    = 10%
 * Reliability  = 10%
 */
export function calculateMatch(input: MatchInput): MatchResult {
  const skills = calculateSkillCompatibility(
    input.user.skills,
    input.team.roles,
    input.team.requiredSkills,
  );

  const availability = calculateAvailabilityCompatibility(
    input.user.availabilityHours,
    input.team.availabilityHours,
  );

  const ratings = calculateRatingScore(input.user.rating);

  const interests = calculateInterestCompatibility(
    input.user.interests,
    input.team.interests,
  );

  const reliability = calculateReliabilityScore(input.user.responseReliability);

  const weightedScore =
    (skills * MATCH_WEIGHTS.skills +
      availability * MATCH_WEIGHTS.availability +
      ratings * MATCH_WEIGHTS.ratings +
      interests * MATCH_WEIGHTS.interests +
      reliability * MATCH_WEIGHTS.reliability) /
    100;

  return {
    overallScore: normalizePercentage(weightedScore),
    breakdown: {
      skills,
      availability,
      ratings,
      interests,
      reliability,
    },
  };
}
