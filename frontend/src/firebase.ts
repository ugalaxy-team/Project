import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { browserLocalPersistence, getAuth, GoogleAuthProvider, onAuthStateChanged, setPersistence, type User } from "firebase/auth";
import { initializeUI, providerPopupStrategy, requireDisplayName } from '@firebase-oss/ui-core';
import { setUser, type ApiUserData, type FirebaseUserData, type UserData } from "./slices/user";
import { store } from "./store";
import { queryClient } from "./api/queryClient";
import { getProfile } from "./api/requests/getProfile";

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

const baseApiUserData: ApiUserData = {
    roles: [],
    notifications: [],
    role_requests: [],
    created_tournaments: [],
    telegram: undefined,
    github: undefined,
    discord: undefined,
};

export const syncUser = async (user: User | null) => {
    if (!user) {
        store.dispatch(setUser(null));
        return;
    }

    const firebaseUserData: FirebaseUserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName ?? user.email ?? user.uid,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        isAnonymous: user.isAnonymous,
    };

    try {
        const apiUserData = await queryClient.fetchQuery<ApiUserData>({
            queryKey: ['user', user.uid],
            queryFn: async () => {
                const data = await getProfile(user);
                if (!data) return null;
                return data;
            },
        });

        const userData: UserData = {
            ...baseApiUserData,
            ...firebaseUserData,
            ...apiUserData,
        };

        store.dispatch(setUser(userData));
        console.log('User authenticated!');
    } catch (error) {
        console.error('Failed to sync user with API, falling back to Firebase data', error);
        const userData: UserData = {
            ...baseApiUserData,
            ...firebaseUserData,
        };
        store.dispatch(setUser(userData));
    }
};

onAuthStateChanged(auth, async (user) => {
    await syncUser(user);
});

export default app;
export { analytics, auth, ui, google };
