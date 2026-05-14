import type { User } from "firebase/auth";
import apiClient from "../client";
import { authHeaders } from "./auth";
import type { CriterionCreateData } from "./createTask";

export interface TaskUpdateData {
  title?: string;
  description?: string | null;
  start_time?: string;
  end_time?: string;
  requirements?: string[];
  criteria?: CriterionCreateData[];
}

export const updateTask = async (
  tournamentId: number,
  taskId: number,
  data: TaskUpdateData,
  user: User,
) => {
  const resp = await apiClient.patch(
    `/tournaments/${tournamentId}/tasks/${taskId}/`,
    data,
    { headers: await authHeaders(user) },
  );
  return resp.data;
};
