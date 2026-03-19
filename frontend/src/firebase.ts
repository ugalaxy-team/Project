import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { browserLocalPersistence, getAuth, GoogleAuthProvider, onAuthStateChanged, setPersistence } from "firebase/auth";
import { initializeUI, providerPopupStrategy, requireDisplayName } from '@firebase-oss/ui-core';
import { setUser } from "./slices/user";
import { useDispatch } from "react-redux";
import { store, type AppDispatch } from "./store";

const firebaseConfig: FirebaseOptions = {
    apiKey: "AIzaSyDYEFX52SBP1Z4H64li_BD9a-TnrB-8FQ8",
    authDomain: "tournament-project-9a31a.firebaseapp.com",
    projectId: "tournament-project-9a31a",
    storageBucket: "tournament-project-9a31a.firebasestorage.app",
    messagingSenderId: "92371798617",
    appId: "1:92371798617:web:7819c49a21f61a3167bf48",
    measurementId: "G-7BEXQ5VZHD"
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