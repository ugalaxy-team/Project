import { getAuth } from "firebase/auth";

export const Profile = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  return <h1>Вітаю, {user?.displayName}</h1>;
};
