import apiClient from "../client";

export const getAllTournaments = async () => {
  try {
    const resp = await apiClient.get("/tournaments");
    return resp.data;
  } catch (e) {
    console.error(`Error occurred:`, e);
    throw e;
  }
};
