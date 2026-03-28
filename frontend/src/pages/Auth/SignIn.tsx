import { GoogleSignInButton, SignInAuthScreen } from "@firebase-oss/ui-react";
import { useNavigate } from "react-router-dom";
import { google } from "../../firebase";

const SignIn = () => {
    const navigate = useNavigate();
    const handleSignIn = () => {
        navigate('/');
    };
    return <SignInAuthScreen
        onSignIn={handleSignIn}
        onForgotPasswordClick={() => navigate('/auth/forgot-password/')}
        onSignUpClick={() => navigate('/auth/sign-up')}>
        <GoogleSignInButton onSignIn={handleSignIn} provider={google} />
    </SignInAuthScreen>
}

export default SignIn;