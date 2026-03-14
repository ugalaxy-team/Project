import type { User } from "firebase/auth";
import apiClient from "../client";

const register = async (user: User, callback?: Function) => {
    try {
        await apiClient.post<{ token: string }>('/auth/register/', {
            id_token: await user.getIdToken(),
        });
        callback && callback();
    } catch (e) {
        console.log(`Error occured ${e}`);
    }
}

export default register;