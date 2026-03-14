import { GoogleSignInButton, SignInAuthScreen } from "@firebase-oss/ui-react";
import { Link, useNavigate } from "react-router-dom";
import { google } from "../../firebase";
import type { UserCredential } from "firebase/auth";
import useOAuthLogin from "../../hooks/useOAuthLogin";


const SignIn = () => {
    const navigate = useNavigate();
    const handleSignIn = () => {
        navigate('/');
    };
    const OAuthLogin = useOAuthLogin();
    return <>
        <SignInAuthScreen onSignIn={handleSignIn}>
            <GoogleSignInButton onSignIn={(cred: UserCredential) => OAuthLogin(cred)} provider={google} />
            <Link to={'/auth/sign-up'}>Не маєте аккаунту? Створіть його!</Link>
        </SignInAuthScreen>
    </>;
}

export default SignIn;