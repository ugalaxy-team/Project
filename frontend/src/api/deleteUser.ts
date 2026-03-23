import { auth } from "../firebase";
import { setUser } from "../slices/user";
import { store } from "../store";
import apiClient from "./client";

const deleteUser = async (token: string) => {
    try {
        await apiClient.delete('/profile/', {
            headers: {
                Authorization: `Bearer ${token}`
            },
        });
        store.dispatch(setUser(null));
    } catch (e) {
        console.log(`Error occured ${e}`);
    }
}

export default deleteUser;