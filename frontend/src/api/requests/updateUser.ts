import { auth } from "../../firebase";
import apiClient from "../client";

export const updateUser = async (userId: string, data: any) => {
    try {
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
            throw new Error("Користувач не авторизований у Firebase");
        }

        const token = await currentUser.getIdToken();
        const response = await apiClient.patch(`/users/${userId}/`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (e) {
        console.error(`Error occurred: ${e}`);
        throw e
    }
}