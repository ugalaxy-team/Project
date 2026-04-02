import { GoogleSignInButton, useUI } from "@firebase-oss/ui-react";
import { Link, useNavigate } from "react-router-dom";
import { auth, google } from "../../firebase";
import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDisplayName } from "../../slices/user";
import { store } from "../../store";
import type { FirebaseError } from "firebase/app";
import { getTranslation } from "@firebase-oss/ui-core";

const SignUp = () => {
  const navigate = useNavigate();
  // The reason we use our own form and not SignUpAuthScreen is
  // the display name is set after the user creation using updateProfile
  // Because of it the displayName is empty in redux when you register an account
  // There is no way to track this event somehow, so we have to update the profile ourselves
  const ui = useUI();
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string | null>>({
    email: null,
    password: null,
  });
  const handleUpdate = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    setFormData({
      ...formData,
      [target.name]: target.value,
    });
  };
  const handleSignUp = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.displayName || !formData.email || !formData.password) return;
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );
      await updateProfile(cred.user, {
        displayName: formData.displayName,
      });
      store.dispatch(setDisplayName(formData.displayName));
      navigate("/");
    } catch (e) {
      const err = e as FirebaseError;
      console.log(err.code);
      // TODO?: Maybe we can find a way to handle the errors properly
      if (err.code == "auth/email-already-in-use") {
        setFormErrors({
          ...formErrors,
          email: getTranslation(ui, "errors", "emailAlreadyInUse"),
        });
      } else if (err.code == "auth/password-does-not-meet-requirements") {
        setFormErrors({
          ...formErrors,
          password: getTranslation(ui, "errors", "weakPassword"),
        });
      }
    }
  };
  return (
    <form onSubmit={handleSignUp}>
      <GoogleSignInButton provider={google} />
      <input
        onChange={handleUpdate}
        autoComplete="username"
        type="text"
        name="displayName"
        id="displayName"
        value={formData.displayName}
      />
      <input
        onChange={handleUpdate}
        autoComplete="email"
        type="email"
        name="email"
        id="email"
        value={formData.email}
      />
      {formErrors.email && <p>{formErrors.email}</p>}
      <input
        onChange={handleUpdate}
        autoComplete="new-password"
        type="password"
        name="password"
        id="password"
        value={formData.password}
      />
      {formErrors.password && <p>{formErrors.password}</p>}
      <input type="submit" value="Register!" />
      <Link to={"/auth/sign-in"}>Вже маєте аккаунт? Увійдіть у нього!</Link>
    </form>
  );
};

export default SignUp;
