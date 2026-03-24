import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import deleteUser from "../../api/deleteUser";

export const Profile = () => {
  const user = useSelector((s: RootState) => s.user);
  const handleDeleteUser = async () => {
    if (!user) return;
    deleteUser(user.idToken);
  };

  return <div>
    <h1>Вітаю, {user?.displayName}</h1>
    <button onClick={handleDeleteUser}>Delete</button>
  </div>;
};
