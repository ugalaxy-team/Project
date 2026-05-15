import type { User } from "firebase/auth";
import apiClient from "../client";
import { authHeaders } from "./auth";

export interface CriterionCreateData {
  name: string;
  description?: string | null;
  weight?: number;
  max_score?: number;
}

export interface TaskCreateData {
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  requirements: string[];
  criteria?: CriterionCreateData[];
}

export const createTask = async (
  tournamentId: number,
  data: TaskCreateData,
  user: User,
) => {
  const resp = await apiClient.post(
    `/tournaments/${tournamentId}/tasks/`,
    data,
    { headers: await authHeaders(user) },
  );
  return resp.data;
};
