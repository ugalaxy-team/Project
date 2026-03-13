import { GoogleSignInButton, SignUpAuthScreen } from "@firebase-oss/ui-react";
import { Link, useNavigate } from "react-router-dom";
import { google } from "../../firebase";


const SignUp = () => {
    const navigate = useNavigate();
    const handleSignUp = () => {
        navigate('/auth/sign-in/');
    };
    return <>
        <SignUpAuthScreen onSignUp={handleSignUp}>
            <GoogleSignInButton onSignIn={handleSignUp} provider={google} />
            <Link to={'/auth/sign-in'}>Вже маєте аккаунт? Увійдіть у нього!</Link>
        </SignUpAuthScreen>
    </>;
}

export default SignUp;