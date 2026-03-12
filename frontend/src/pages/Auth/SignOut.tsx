import { getAuth, signOut } from "firebase/auth";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";

const SignOut = () => {
    useEffect(() => {
        const auth = getAuth();
        signOut(auth).catch((error) => {
            console.log(error);
        });
    }, []);
    return <Navigate to={'/'} replace={true} />;
}

export default SignOut;