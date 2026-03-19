import { signOut } from "firebase/auth";
import { useEffect } from "react";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";

const SignOut = () => {
    const navigate = useNavigate();
    useEffect(() => {
        signOut(auth).then(() => {
            navigate('/', { replace: true });
        }).catch((error) => {
            console.log(error);
        });
    }, []);
    return <div>Loading...</div>;
}

export default SignOut;