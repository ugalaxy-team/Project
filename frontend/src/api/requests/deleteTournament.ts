import { getAuth } from "firebase/auth";
import apiClient from "../client";

export const deleteTournament = async (tournamentId: number) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("Користувач не авторизований");
    }

    const token = await user.getIdToken();
    const response = await apiClient.delete(`/tournaments/${tournamentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })

    return response.data;
  } catch (e) {
    console.error(`Error occurred: ${e}`);
    throw e;
  }
};
