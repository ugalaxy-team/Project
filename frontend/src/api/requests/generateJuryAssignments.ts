import type { User } from "firebase/auth";
import apiClient from "../client";
import { authHeaders } from "./auth";
import type { JuryAssignment } from "./types";

export const generateJuryAssignments = async (
  tournamentId: number,
  taskId: number,
  user: User,
) => {
  const resp = await apiClient.post<JuryAssignment[]>(
    `/tournaments/${tournamentId}/tasks/${taskId}/assignments/generate/`,
    {},
    { headers: await authHeaders(user) },
  );
  return resp.data;
};
