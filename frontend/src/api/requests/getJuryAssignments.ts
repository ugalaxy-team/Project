import type { User } from "firebase/auth";

import apiClient from "../client";
import { authHeaders } from "./auth";
import type { JuryAssignment } from "./types";

export const getJuryAssignments = async (
  taskId: string | number,
  user: User,
) => {
  const resp = await apiClient.get<JuryAssignment[]>(
    `/jury/tasks/${taskId}/assignments/`,
    {
      headers: await authHeaders(user),
    },
  );
  return resp.data;
};
