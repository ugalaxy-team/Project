import type { User } from "firebase/auth";
import apiClient from "../client";

export const deleteUser = async (user: User) => {
    try {
        const token = await user.getIdToken();
        await apiClient.delete('/profile/', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (e) {
        console.log(`Error occured ${e}`);
    }
}