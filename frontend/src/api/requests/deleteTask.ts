import apiClient from "../client";
import { getAuth } from "firebase/auth";

export const deleteTask = async (tournamentId: number, taskId: number) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("Користувач не авторизований");
    }

    const token = await user.getIdToken();

    await apiClient.delete(
      `/tournaments/${tournamentId}/tasks/${taskId}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (e) {
    console.error(`Error occurred:`, e);
    throw e;
  }
};
