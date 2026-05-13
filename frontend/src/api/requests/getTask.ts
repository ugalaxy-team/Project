import apiClient from "../client";
import type { JuryTask } from "./types";

export const getTask = async (tournamentId: number, taskId: number) => {
  const resp = await apiClient.get<JuryTask>(
    `/tournaments/${tournamentId}/tasks/${taskId}/`,
  );
  return resp.data;
};
