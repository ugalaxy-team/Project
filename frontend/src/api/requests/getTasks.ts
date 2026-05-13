import apiClient from "../client";

export const getTasks = async (tournamentId: number) => {
  try {
    const resp = await apiClient.get(`/tournaments/${tournamentId}/tasks`);
    return resp.data;
  } catch (e) {
    console.error(`Error occurred:`, e);
    throw e;
  }
};
