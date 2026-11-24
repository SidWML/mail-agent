import type { User } from "@/types/mailbox";

export interface TeamGroup {
  team: string;
  /** Regions the team's members work in, for example ["India", "China"]. */
  regions: string[];
  members: User[];
}

/** People grouped by team, teams in alphabetical order. People without a team go under "No team". */
export function groupUsersByTeam(users: User[]): TeamGroup[] {
  const groups = new Map<string, User[]>();
  for (const user of users) {
    const team = user.team ?? "No team";
    groups.set(team, [...(groups.get(team) ?? []), user]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([team, members]) => ({
      team,
      members,
      regions: [...new Set(members.map((member) => member.region).filter((region): region is string => Boolean(region)))],
    }));
}

/** Filter value that means "everyone in this team", understood by the mails and dashboard APIs. */
export const teamFilterValue = (team: string) => `team:${team}`;
