// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeUI, requireDisplayName } from '@firebase-oss/ui-core';

const firebaseConfig = {
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
const ui = initializeUI({
    app,
    behaviors: [
        requireDisplayName(),
    ],
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        console.log(uid);
    } else {
        console.log('Sign out!')
    }
});

export default app;
export { analytics, auth, ui };