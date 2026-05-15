import apiClient from "../client";

export interface SubmissionUrl {
  url_id: string;
  value: string;
}

export interface CreateSubmissionPayload {
  team_id: number;
  urls: SubmissionUrl[];
}

export const createSubmission = async (
  tournamentId: number,
  taskId: number,
  payload: CreateSubmissionPayload,
) => {
  const response = await apiClient.post(
    `/tournaments/${tournamentId}/tasks/${taskId}/submissions/`,
    payload,
  );
  return response.data;
};
