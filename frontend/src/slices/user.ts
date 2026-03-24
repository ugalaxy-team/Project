import { createSlice } from "@reduxjs/toolkit";

interface FirebaseUserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
    isAnonymous: boolean;
    idToken: string;
}

interface UserState {
    user: FirebaseUserData | null;
};

const initialUserState: UserState = {
    user: null,
}

export const userSlice = createSlice({
    name: 'user',
    initialState: initialUserState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setDisplayName: (state, action) => {
            if (!state.user) return;
            state.user.displayName = action.payload;
        }
    }
})

export const { setUser, setDisplayName } = userSlice.actions;