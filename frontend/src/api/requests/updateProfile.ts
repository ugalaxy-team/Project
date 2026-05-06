import type { User } from "firebase/auth";
import apiClient from "../client";

interface UpdateUserData {
  full_name?: string;
  telegram?: string;
  github?: string;
  discord?: string;
}

export const updateProfile = async (user: User, data: UpdateUserData) => {
  try {
    const token = await user.getIdToken();
    const response = await apiClient.patch(`/profile/`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (e) {
    console.error(`Error occurred: ${e}`);
    throw e;
  }
};
