import apiClient from "../client";
import type { User } from "firebase/auth";

interface RoleRequestInfo {
  option_name: string;
  value: string;
}

export const requestRole = async (
  roleName: string,
  user: User,
  userId: number,
  info: RoleRequestInfo[],
) => {
  const token = await user.getIdToken();
  const response = await apiClient.post(
    "/role-requests/",
    {
      role_name: roleName,
      user_id: userId,
      info,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.status;
};
