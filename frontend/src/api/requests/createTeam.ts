import apiClient from "../client";

export interface TeamMemberPayload {
  full_name: string;
  email: string;
  telegram: string;
  educational_institution: string;
}

export interface CreateTeamPayload {
  name: string;
  team_email: string;
  contact_info: string;
  captain: TeamMemberPayload;
  members: TeamMemberPayload[];
}

export const createTeam = async (
  tournamentId: number,
  payload: CreateTeamPayload,
) => {
  const response = await apiClient.post(
    `/tournaments/${tournamentId}/teams/`,
    payload,
  );
  return response.data;
};
