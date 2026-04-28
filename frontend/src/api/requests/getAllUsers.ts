import apiClient from "../client";

export const getAllUsers = async () => {
    try {
        const resp = await apiClient.get("/users",);
        return resp.data;
    } catch (e) {
        console.error(`Error occurred:`, e);
        throw e; 
    }
}