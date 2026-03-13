import { auth } from "../../firebase";

export const Profile = () => {
  const user = auth.currentUser;

  return <h1>Вітаю, {user?.displayName}</h1>;
};
