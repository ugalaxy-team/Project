import { signOut } from "firebase/auth";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../../firebase";

const SignOut = () => {
    useEffect(() => {
        signOut(auth).catch((error) => {
            console.log(error);
        });
    }, []);
    return <Navigate to={'/'} replace={true} />;
}

export default SignOut;