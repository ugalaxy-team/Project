import { ForgotPasswordAuthScreen } from "@firebase-oss/ui-react"
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const navigate = useNavigate();
    return <ForgotPasswordAuthScreen onBackToSignInClick={() => navigate('/auth/sign-in/')}>

    </ForgotPasswordAuthScreen>;
}

export default ForgotPassword;