import { GoogleSignInButton, SignInAuthScreen } from "@firebase-oss/ui-react";
import { Link, useNavigate } from "react-router-dom";
import { google } from "../../firebase";


const SignIn = () => {
    const navigate = useNavigate();
    const handleSignIn = () => {
        navigate('/');
    };
    return <>
        <SignInAuthScreen onSignIn={handleSignIn}>
            <GoogleSignInButton onSignIn={handleSignIn} provider={google} />
            <Link to={'/auth/sign-up'}>Не маєте аккаунту? Створіть його!</Link>
        </SignInAuthScreen>
    </>;
}

export default SignIn;