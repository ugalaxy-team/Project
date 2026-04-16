import apiClient from "../client";

export const getUser = async (uid: string) => {
    try {
        const resp = await apiClient.get(`/users/${uid}/`);
        return resp.data;
    } catch (e) {
        console.log(`Error occured ${e}`);
    }
}