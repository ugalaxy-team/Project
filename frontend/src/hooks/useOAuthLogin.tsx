import type { UserCredential } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import register from "../api/auth/register";

const useOAuthLogin = () => {
    const navigate = useNavigate();
    return (cred: UserCredential) => {
        register(cred.user);
        // navigate is not passed in callback because if user alredy exists, the callback will not be executed
        navigate('/');
    };
}

export default useOAuthLogin;