import type { User } from "firebase/auth";

import apiClient from "../client";
import { authHeaders } from "./auth";
import type { JuryTask } from "./types";

export const finishEvaluation = async (
  tournamentId: number,
  taskId: number,
  user: User,
) => {
  const resp = await apiClient.post<JuryTask>(
    `/tournaments/${tournamentId}/tasks/${taskId}/finish-evaluation/`,
    {},
    { headers: await authHeaders(user) },
  );
  return resp.data;
};
