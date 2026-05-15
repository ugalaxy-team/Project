import apiClient from "../client";
import { getAuth } from "firebase/auth";

export interface TournamentData {
  title: string;
  description: string;
  start_date: string;
  reg_start: string;
  reg_end: string;
  min_people_in_team: number; 
  max_people_in_team: number;
  max_teams: number;
}

export const createTournament = async (data: TournamentData) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("Користувач не авторизований");
    }

    const token = await user.getIdToken();

    const resp = await apiClient.post("/tournaments/", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return resp.data;
  } catch (e) {
    console.error(`Error occurred:`, e);
    throw e;
  }
};