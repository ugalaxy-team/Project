import apiClient from "../client";
import { getAuth } from "firebase/auth";

export interface TaskUpdateData {
  title?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  requirements?: string[];
}

export const updateTask = async (
  tournamentId: number,
  taskId: number,
  data: TaskUpdateData
) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("Користувач не авторизований");
    }

    const token = await user.getIdToken();

    const resp = await apiClient.patch(
      `/tournaments/${tournamentId}/tasks/${taskId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return resp.data;
  } catch (e) {
    console.error(`Error occurred:`, e);
    throw e;
  }
};
