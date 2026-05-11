import apiClient from "../client";

interface UpdateTournamentData {
  title?: string;
  description?: string;
  start_date?: string;
  reg_start?: string;
  reg_end?: string;
  max_teams?: number;
}

export const updateTournament = async (
  tournamentId: number,
  data: UpdateTournamentData,
) => {
  try {
    const response = await apiClient.patch(
      `/tournaments/${tournamentId}`,
      data,
    );

    return response.data;
  } catch (e) {
    console.error(`Error occurred: ${e}`);
    throw e;
  }
};
