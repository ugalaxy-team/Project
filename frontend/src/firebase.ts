import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { browserLocalPersistence, getAuth, GoogleAuthProvider, onAuthStateChanged, setPersistence } from "firebase/auth";
import { initializeUI, providerPopupStrategy, requireDisplayName } from '@firebase-oss/ui-core';
import { setUser } from "./slices/user";
import { useDispatch } from "react-redux";
import { store, type AppDispatch } from "./store";

const firebaseConfig: FirebaseOptions = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
// TODO: implement redirect strategy
const ui = initializeUI({
    app,
    behaviors: [
        requireDisplayName(),
        providerPopupStrategy(),
    ],
});
await setPersistence(auth, browserLocalPersistence);
const google = new GoogleAuthProvider();
google.addScope('profile');
google.addScope('email');

onAuthStateChanged(auth, (user) => {
    if (user) {
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            isAnonymous: user.isAnonymous,
        };
        store.dispatch(setUser(userData));
        console.log('User authenticated!');
    } else {
        store.dispatch(setUser(null));
        console.log('Sign out!')
    }
});

export default app;
export { analytics, auth, ui, google };