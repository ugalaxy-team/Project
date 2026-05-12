import type { User } from "firebase/auth";

import apiClient from "../client";
import { authHeaders } from "./auth";
import type { CriterionScore, SubmissionEvaluation } from "./types";

export const saveAssignmentEvaluation = async (
  assignmentId: number,
  data: { comment?: string; criterion_scores: CriterionScore[] },
  user: User,
  hasExistingEvaluation: boolean,
) => {
  const config = {
    headers: await authHeaders(user),
  };
  const resp = hasExistingEvaluation
    ? await apiClient.patch<SubmissionEvaluation>(
        `/jury/assignments/${assignmentId}/evaluation`,
        data,
        config,
      )
    : await apiClient.post<SubmissionEvaluation>(
        `/jury/assignments/${assignmentId}/evaluation`,
        data,
        config,
      );
  return resp.data;
};
