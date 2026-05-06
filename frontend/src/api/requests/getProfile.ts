import type { User } from "firebase/auth";
import apiClient from "../client";

export const getProfile = async (user: User) => {
  try {
    const token = await user.getIdToken();
    const resp = await apiClient.get("/profile/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return resp.data;
  } catch (e) {
    console.log(`Error occured ${e}`);
  }
};
