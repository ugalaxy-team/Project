import apiClient from "../client";
import { auth } from  "../../firebase";

interface Info {
    option_name: string;
    value: string;
}

export const roleRequest = async (role_name: string, user_id: number, info: Info[]) => {
    const user = auth.currentUser;
    
    if (!user) {
        throw new Error("Користувач не авторизований");
    }
    
    const token = await user.getIdToken();
    const response = await apiClient.post(
        "/role-requests/", 
        {
            role_name: role_name,
            user_id: user_id,
            info: info
        }, 
        {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }
    );
    
    return response.status;
}