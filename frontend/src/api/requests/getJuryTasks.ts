import type { User } from "firebase/auth";

import apiClient from "../client";
import { authHeaders } from "./auth";
import type { JuryTask } from "./types";

export const getJuryTasks = async (user: User) => {
  const resp = await apiClient.get<JuryTask[]>("/jury/tasks/", {
    headers: await authHeaders(user),
  });
  return resp.data;
};
