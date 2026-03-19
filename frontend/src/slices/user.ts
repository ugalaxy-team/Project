import { createSlice } from "@reduxjs/toolkit";

interface FirebaseUserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
    isAnonymous: boolean;
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

    }
})

export const { setUser } = userSlice.actions;