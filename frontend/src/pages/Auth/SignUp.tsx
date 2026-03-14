import { GoogleSignInButton, SignUpAuthScreen } from "@firebase-oss/ui-react";
import { Link, useNavigate } from "react-router-dom";
import { type User, type UserCredential } from 'firebase/auth';
import register from "../../api/auth/register";
import { google } from "../../firebase";
import useOAuthLogin from "../../hooks/useOAuthLogin";

const SignUp = () => {
    const navigate = useNavigate();
    const handleSignUp = (user: User) => {
        register(user, () => {
            navigate('/');
        });
    };
    const OAuthLogin = useOAuthLogin();
    return <>
        <SignUpAuthScreen onSignUp={handleSignUp}>
            <GoogleSignInButton onSignIn={(cred: UserCredential) => OAuthLogin(cred)} provider={google} />
            <Link to={'/auth/sign-in'}>Вже маєте аккаунт? Увійдіть у нього!</Link>
        </SignUpAuthScreen>
    </>;
}

export default SignUp;