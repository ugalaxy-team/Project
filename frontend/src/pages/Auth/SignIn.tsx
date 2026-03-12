import { SignInAuthScreen } from "@firebase-oss/ui-react";
import { Link, useNavigate } from "react-router-dom";


const SignIn = () => {
    const navigate = useNavigate();
    const handleSignIn = () => {
        navigate('/');
    };
    return <>
        <SignInAuthScreen onSignIn={handleSignIn}>
            <Link to={'/auth/sign-up'}>Не маєте аккаунту? Створіть його!</Link>
        </SignInAuthScreen>
    </>;
}

export default SignIn;