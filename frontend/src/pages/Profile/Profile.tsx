import { useSelector } from "react-redux";
import { auth } from "../../firebase";
import type { RootState } from "../../store";

export const Profile = () => {
  const user = useSelector((s: RootState) => s.user);

  return <h1>Вітаю, {user?.displayName}</h1>;
};
