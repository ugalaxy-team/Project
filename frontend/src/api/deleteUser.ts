import type { User } from "firebase/auth";
import { auth } from "../firebase";
import { setUser } from "../slices/user";
import { store } from "../store";
import apiClient from "./client";

const deleteUser = async (user: User) => {
    try {
        const token = await user.getIdToken();
        await apiClient.delete('/profile/', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        await auth.updateCurrentUser(null);
        store.dispatch(setUser(null));
    } catch (e) {
        console.log(`Error occured ${e}`);
    }
}

export default deleteUser;