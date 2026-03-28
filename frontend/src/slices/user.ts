import { createSlice } from "@reduxjs/toolkit";

export interface FirebaseUserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
    isAnonymous: boolean;
}

export interface ApiUserData {
    roles: object[];
    notifications: object[];
    role_requests: object[];
    created_tournaments: object[];
}

export interface UserData extends ApiUserData, FirebaseUserData { };

interface UserState {
    user: UserData | null | undefined;
};

const initialUserState: UserState = {
    user: undefined,
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