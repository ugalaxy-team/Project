import type { User } from "firebase/auth";
import apiClient from "../client";
import { authHeaders } from "./auth";

export const deleteTask = async (
  tournamentId: number,
  taskId: number,
  user: User,
) => {
  await apiClient.delete(
    `/tournaments/${tournamentId}/tasks/${taskId}/`,
    { headers: await authHeaders(user) },
  );
};
