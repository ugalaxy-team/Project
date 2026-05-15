import apiClient from "../client";

export interface LeaderboardEntry {
  submission_id: number;
  team_id: number;
  team_name: string;
  average_score: number;
  total_score: number;
  submitted_reviews: number;
}

export const getTournamentLeaderboard = async (
  tournamentId: number,
): Promise<LeaderboardEntry[]> => {
  const response = await apiClient.get<LeaderboardEntry[]>(
    `/tournaments/${tournamentId}/leaderboard/`,
  );
  return response.data;
};
