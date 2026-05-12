import apiClient from "../client";
import { getAuth } from "firebase/auth";

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

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("Користувач не авторизований");
    }

    const token = await user.getIdToken();

    const response = await apiClient.patch(`/tournaments/${tournamentId}`,data,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  } catch (e) {
    console.error(`Error occurred: ${e}`);
    throw e;
  }
};
