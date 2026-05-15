import type { User } from "firebase/auth";

export const authHeaders = async (user: User) => {
  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
  };
};
